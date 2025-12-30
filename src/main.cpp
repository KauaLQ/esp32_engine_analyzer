// =========================================
// Rotorial ESP32 - Provisionamento + Telemetria
// Tudo em um único main.cpp (Hackathon-ready)
// =========================================

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <time.h>
#include <math.h>

#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <AsyncJson.h>

#include <Adafruit_MCP3421.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

// ============================
// BACKEND FIXO (NÃO MUDAR)
// ============================
static const char* BACKEND_BASE_URL    = "https://hackaton-rotorial.onrender.com";
static const char* PROVISION_URL       = "https://hackaton-rotorial.onrender.com/provision";
static const char* TELEMETRY_URL       = "https://hackaton-rotorial.onrender.com/telemetry";

// NOVOS ENDPOINTS (você pediu)
static const char* AUTH_LOGIN_URL      = "https://hackaton-rotorial.onrender.com/auth/login";
static const char* PATIOS_PUBLIC_URL   = "https://hackaton-rotorial.onrender.com/patios/public";

// TOKEN FIXO (NÃO RENDERIZAR NO HTML)
static const char* PROVISION_HEADER    = "x-provision-token";
static const char* PROVISION_TOKEN     = "santoDeus@1";

// FW
static const char* FW_VERSION          = "1.0.0";

// Setup PIN
static const uint32_t SETUP_PIN_TTL_MS = 10UL * 60UL * 1000UL; // 10 min

// Telemetria
static const uint32_t TELEMETRY_PERIOD_MS = 10UL * 1000UL; // 10s
static const int TELEMETRY_BUFFER_SIZE = 20;

// NTP (Brasil - Fortaleza UTC-3)
static const long GMT_OFFSET_SEC = -3 * 3600;
static const int  DAYLIGHT_OFFSET_SEC = 0;

// ============================
// PINOS / I2C (do seu hardware)
// ============================
// breakout MCP3421: sda1 scl1 v+1 vcc gnd v+2 scl2 sda2
#define SCL1 9
#define SDA1 8
#define SCL2 7
#define SDA2 14

// relação divisiva para tensões ficarem dentro do range do MCP3421
#define DIVISOR_GAIN (1.0f / 3.0f)

// ACS712 5A
#define ACS_SENS 0.185f
#define AC_SAMPLES 100
#define AC_SAMPLE_DELAY_MS 4

// Trafo tensão
#define TRAFO_SAMPLES 120
#define TRAFO_RATIO (220.0f / 13.0f)
#define DIVISOR_TRAFO_GAIN (1.0f/11.0f)
#define TRAFO_SAMPLE_DELAY_MS 4

// MCP3421 config (tipos do Adafruit lib)
static constexpr mcp3421_gain       GAIN_MCP       = GAIN_1X;
static constexpr mcp3421_resolution RESOLUTION_MCP = RESOLUTION_12_BIT; // 240 SPS
static constexpr mcp3421_mode       MODE_MCP       = MODE_CONTINUOUS;

// I2C settings (WDT / robustez)
static const uint32_t I2C_HZ = 100000; // 100kHz (mais robusto que 400k em cabo/ambiente ruim)

// ============================
// Web / NVS / Estado
// ============================
static AsyncWebServer server(80);
static Preferences prefs;
static const char* NVS_NS = "rotorial";

static String g_deviceId;
static bool   g_provisioned = false;
static String g_machineId;

static String g_wifiSsid;
static String g_wifiPass;

static String g_operatorUserId;     // do login
static String g_accessToken;        // armazenado, não exposto
static String g_refreshToken;       // armazenado, não exposto

static String g_apSsid;
static String g_apPass;
static bool   g_apRunning = false;

static String g_setupPin;
static uint32_t g_setupPinExpiresMs;
static String g_setupSessionToken;
static uint32_t g_setupSessionExpiresMs;

static String g_lastTelemetryAtIso;   // RAM
static int    g_lastTelemetryHttp = 0;

static uint32_t g_seq = 0;

// ============================
// RTOS / Sensores
// ============================
typedef struct {
  float temperatureC;
  float currentA;
  float voltageV;
} measurement_t;

static measurement_t g_latest;
static SemaphoreHandle_t g_dataMutex;

// Sensores
static TwoWire I2C_1 = TwoWire(0);
static TwoWire I2C_2 = TwoWire(1);
static Adafruit_MCP3421 mcp1; // tensão (trafo)
static Adafruit_MCP3421 mcp2; // corrente (ACS)
static Adafruit_BME280 bme;

static float acsOffset = 2.5f;

// ============================
// Log ring (UI logs)
// ============================
static const int LOG_MAX = 140;
static String g_logs[LOG_MAX];
static int g_logPos = 0;
static bool g_logWrapped = false;

static void logf(const char* fmt, ...) {
  char buf[256];
  va_list args;
  va_start(args, fmt);
  vsnprintf(buf, sizeof(buf), fmt, args);
  va_end(args);

  Serial.println(buf);

  g_logs[g_logPos] = String(buf);
  g_logPos = (g_logPos + 1) % LOG_MAX;
  if (g_logPos == 0) g_logWrapped = true;
}

static String getLogsText() {
  String out;
  if (!g_logWrapped) {
    for (int i = 0; i < g_logPos; i++) out += g_logs[i] + "\n";
  } else {
    for (int i = g_logPos; i < LOG_MAX; i++) out += g_logs[i] + "\n";
    for (int i = 0; i < g_logPos; i++) out += g_logs[i] + "\n";
  }
  return out;
}

// ============================
// Utils
// ============================
static String htmlEscape(const String& s) {
  String o; o.reserve(s.length() + 16);
  for (size_t i = 0; i < s.length(); i++) {
    char c = s[i];
    switch (c) {
      case '&': o += "&amp;"; break;
      case '<': o += "&lt;"; break;
      case '>': o += "&gt;"; break;
      case '"': o += "&quot;"; break;
      case '\'': o += "&#39;"; break;
      default: o += c; break;
    }
  }
  return o;
}

static String nowIsoIfAvailable() {
  time_t now = time(nullptr);
  if (now < 100000) return "";
  struct tm tm_utc;
  gmtime_r(&now, &tm_utc);
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tm_utc);
  return String(buf);
}

static String random6Digits() {
  uint32_t r = esp_random();
  uint32_t pin = (r % 900000) + 100000;
  return String(pin);
}

static String randomToken8() {
  uint32_t r = esp_random();
  char buf[16];
  snprintf(buf, sizeof(buf), "%08X", (unsigned)r);
  return String(buf);
}

static bool pinStillValid() {
  return (millis() <= g_setupPinExpiresMs);
}

static bool sessionValid(AsyncWebServerRequest* req) {
  if (!pinStillValid()) return false;
  if (millis() > g_setupSessionExpiresMs) return false;
  if (!req->hasHeader("Cookie")) return false;

  String cookie = req->header("Cookie");
  String key = "rt_sess=";
  int idx = cookie.indexOf(key);
  if (idx < 0) return false;
  int start = idx + key.length();
  int end = cookie.indexOf(';', start);
  String token = (end < 0) ? cookie.substring(start) : cookie.substring(start, end);
  token.trim();
  return token.length() > 0 && token == g_setupSessionToken;
}

// Helpers para JSON String sem ponteiro nulo
static String jsonStringOrEmpty(JsonVariantConst v) {
  if (v.is<const char*>()) return String(v.as<const char*>());
  if (v.is<String>()) return v.as<String>();
  return String("");
}

static void sendSetupBlocked(AsyncWebServerRequest* req) {
  req->send(403, "text/html; charset=utf-8",
    "<h2>Setup bloqueado</h2>"
    "<p>Este dispositivo já foi provisionado.</p>"
    "<p>Se precisar reconfigurar, use <b>Factory Reset</b>.</p>"
    "<p><a href='/'>Voltar</a></p>");
}

// 1) Protege área de SETUP: bloqueia se provisionado + exige sessão/PIN
static void requireSetupSessionOrPinPage(AsyncWebServerRequest* req, const String& nextPath) {
  if (g_provisioned) { sendSetupBlocked(req); return; }
  if (sessionValid(req)) return;

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>PIN de Setup</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:18px}"
          ".card{max-width:520px;margin:0 auto;background:rgba(255,255,255,.04);"
          "border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          "input,button{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);"
          "background:rgba(255,255,255,.06);color:#e6eefc}"
          "button{cursor:pointer;font-weight:800;margin-top:10px}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2>Área protegida</h2>";
  html += "<p>Digite o <b>PIN de Setup</b> exibido no display/Serial.</p>";
  if (!pinStillValid()) {
    html += "<p style='color:#ffbd2e'>O PIN expirou. Reinicie o ESP32 para gerar um novo.</p>";
  }
  html += "<form method='POST' action='/setup/auth'>";
  html += "<input name='pin' placeholder='PIN (6 dígitos)' inputmode='numeric' pattern='[0-9]{6}' required />";
  html += "<input type='hidden' name='next' value='" + htmlEscape(nextPath) + "'/>";
  html += "<button type='submit'>Entrar</button>";
  html += "</form>";
  html += "<p style='margin-top:10px'><a href='/'>Voltar</a></p>";
  html += "</div></body></html>";

  req->send(401, "text/html; charset=utf-8", html);
}

// 2) Protege ações sensíveis (ex.: factory reset) mesmo provisionado: exige sessão/PIN
static void requireSensitiveSessionOrPinPage(AsyncWebServerRequest* req, const String& nextPath) {
  if (sessionValid(req)) return;

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>PIN de Segurança</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:18px}"
          ".card{max-width:520px;margin:0 auto;background:rgba(255,255,255,.04);"
          "border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          "input,button{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);"
          "background:rgba(255,255,255,.06);color:#e6eefc}"
          "button{cursor:pointer;font-weight:800;margin-top:10px}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2>Confirme o PIN</h2>";
  html += "<p>Digite o <b>PIN de Setup</b> exibido no display/Serial.</p>";
  if (!pinStillValid()) {
    html += "<p style='color:#ffbd2e'>O PIN expirou. Reinicie o ESP32 para gerar um novo.</p>";
  }
  html += "<form method='POST' action='/setup/auth'>";
  html += "<input name='pin' placeholder='PIN (6 dígitos)' inputmode='numeric' pattern='[0-9]{6}' required />";
  html += "<input type='hidden' name='next' value='" + htmlEscape(nextPath) + "'/>";
  html += "<button type='submit'>Entrar</button>";
  html += "</form>";
  html += "<p style='margin-top:10px'><a href='/'>Voltar</a></p>";
  html += "</div></body></html>";

  req->send(401, "text/html; charset=utf-8", html);
}

static String makeDeviceIdFromMac() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char buf[32];
  snprintf(buf, sizeof(buf), "ROTORIAL-ESP32-%02X%02X%02X", mac[3], mac[4], mac[5]);
  return String(buf);
}

static String makeApSsid() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char buf[32];
  snprintf(buf, sizeof(buf), "ROTORIAL-SETUP-%02X%02X", mac[4], mac[5]);
  return String(buf);
}

static String makeApPass() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char buf[32];
  snprintf(buf, sizeof(buf), "rotorial%02X%02X%02X", mac[3], mac[4], mac[5]); // >= 8 chars
  return String(buf);
}

// ============================
// NVS (sem spam NOT_FOUND)
// ============================
static String nvsGetStringSafe(Preferences& p, const char* key, const String& def = "") {
  if (!p.isKey(key)) return def;
  return p.getString(key, def);
}
static bool nvsGetBoolSafe(Preferences& p, const char* key, bool def = false) {
  if (!p.isKey(key)) return def;
  return p.getBool(key, def);
}
static uint32_t nvsGetUIntSafe(Preferences& p, const char* key, uint32_t def = 0) {
  if (!p.isKey(key)) return def;
  return p.getUInt(key, def);
}

static void nvsLoad() {
  prefs.begin(NVS_NS, true);

  g_provisioned  = nvsGetBoolSafe(prefs, "provisioned", false);
  g_machineId    = nvsGetStringSafe(prefs, "machineId", "");
  g_wifiSsid     = nvsGetStringSafe(prefs, "wifiSsid", "");
  g_wifiPass     = nvsGetStringSafe(prefs, "wifiPass", "");
  g_seq          = nvsGetUIntSafe(prefs, "seq", 0);

  g_operatorUserId = nvsGetStringSafe(prefs, "operatorUserId", "");
  g_accessToken    = nvsGetStringSafe(prefs, "accessToken", "");
  g_refreshToken   = nvsGetStringSafe(prefs, "refreshToken", "");

  prefs.end();

  logf("[NVS] provisioned=%d machineId=%s wifi=%s seq=%u operatorUserId=%s",
       g_provisioned ? 1 : 0,
       g_machineId.c_str(),
       g_wifiSsid.c_str(),
       (unsigned)g_seq,
       g_operatorUserId.c_str());
}

static void nvsSaveWifiAndProvisionDraft(
  const String& ssid, const String& pass,
  const String& machineKey, const String& patioId,
  const String& manufacturer, const String& model,
  const String& status,
  const String& metaTag, const String& metaPowerKw,
  const String& metaVoltNom, const String& metaNotes
) {
  prefs.begin(NVS_NS, false);

  prefs.putString("wifiSsid", ssid);
  prefs.putString("wifiPass", pass);

  prefs.putString("machineKey", machineKey);
  prefs.putString("patioId", patioId);
  prefs.putString("manufacturer", manufacturer);
  prefs.putString("model", model);
  prefs.putString("status", status);

  // operatorUserId vem do login, não do form
  prefs.putString("operatorUserId", g_operatorUserId);

  prefs.putString("metaTag", metaTag);
  prefs.putString("metaPowerKw", metaPowerKw);
  prefs.putString("metaVoltNom", metaVoltNom);
  prefs.putString("metaNotes", metaNotes);

  prefs.putBool("provisioned", false);
  prefs.putString("machineId", "");

  prefs.end();

  g_wifiSsid = ssid;
  g_wifiPass = pass;

  logf("[NVS] Draft salvo (Wi-Fi + provision).");
}

static void nvsMarkProvisioned(const String& machineId) {
  prefs.begin(NVS_NS, false);
  prefs.putBool("provisioned", true);
  prefs.putString("machineId", machineId);
  prefs.end();

  g_provisioned = true;
  g_machineId = machineId;
  logf("[NVS] Provisionado! machineId=%s", g_machineId.c_str());
}

static void nvsSaveSeq(uint32_t seq) {
  prefs.begin(NVS_NS, false);
  prefs.putUInt("seq", seq);
  prefs.end();
  g_seq = seq;
}

static void nvsSaveLogin(const String& userId, const String& accessToken, const String& refreshToken) {
  prefs.begin(NVS_NS, false);
  prefs.putString("operatorUserId", userId);
  prefs.putString("accessToken", accessToken);
  prefs.putString("refreshToken", refreshToken);
  prefs.end();

  g_operatorUserId = userId;
  g_accessToken = accessToken;
  g_refreshToken = refreshToken;

  logf("[AUTH] Login OK. operatorUserId=%s (tokens salvos no NVS, não expostos)", userId.c_str());
}

static void nvsFactoryReset() {
  prefs.begin(NVS_NS, false);
  prefs.clear();
  prefs.end();
  logf("[NVS] Factory reset: namespace rotorial limpo.");
}

// ============================
// Wi-Fi (AP + STA para melhor UX)
// ============================
static void startAP_andMaybeSTA() {
  g_apSsid = makeApSsid();
  g_apPass = makeApPass();

  WiFi.mode(WIFI_AP_STA);

  bool apOk = WiFi.softAP(g_apSsid.c_str(), g_apPass.c_str());
  g_apRunning = apOk;

  IPAddress apIp = WiFi.softAPIP();

  logf("[WIFI] AP %s SSID=%s PASS=%s IP=%s", apOk ? "OK" : "FAIL",
       g_apSsid.c_str(), g_apPass.c_str(), apIp.toString().c_str());

  Serial.println("===== ROTORIAL SETUP =====");
  Serial.printf("SSID: %s\n", g_apSsid.c_str());
  Serial.printf("PASS: %s\n", g_apPass.c_str());
  Serial.printf("IP:   %s\n", apIp.toString().c_str());
  Serial.printf("PIN:  %s (10 min)\n", g_setupPin.c_str());
  Serial.println("==========================");

  if (g_wifiSsid.length()) {
    WiFi.begin(g_wifiSsid.c_str(), g_wifiPass.c_str());
    logf("[WIFI] Tentando STA em paralelo (SSID salvo): %s", g_wifiSsid.c_str());
  }
}

// Conexão STA “bloqueante curta” (usada em setup/http)
static bool ensureSTAConnected(uint32_t timeoutMs = 15000) {
  if (WiFi.status() == WL_CONNECTED) return true;
  if (!g_wifiSsid.length()) return false;

  WiFi.begin(g_wifiSsid.c_str(), g_wifiPass.c_str());

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(250); // delay() aqui é OK (roda fora de task crítica)
  }

  if (WiFi.status() == WL_CONNECTED) {
    logf("[WIFI] STA OK IP=%s RSSI=%d", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    return true;
  }

  logf("[WIFI] STA falhou (sem internet).");
  return false;
}

// ============================
// Sensores
// ============================
static float mcpToVoltage(int32_t adc, float gain, mcp3421_resolution resolution) {
  int32_t maxCounts = 131072;
  switch (resolution) {
    case RESOLUTION_12_BIT: maxCounts = 2048; break;
    case RESOLUTION_14_BIT: maxCounts = 8192; break;
    case RESOLUTION_16_BIT: maxCounts = 32768; break;
    case RESOLUTION_18_BIT: maxCounts = 131072; break;
    default: maxCounts = 131072;
  }
  return (adc * 2.048f) / (maxCounts * gain);
}

static float measureACSOffset() {
  const int N = 50;
  float sum = 0;
  for (int i = 0; i < N; i++) {
    int32_t adc = mcp2.readADC();
    float v = mcpToVoltage(adc, 1.0f, RESOLUTION_MCP);
    sum += v / DIVISOR_GAIN;
    delay(20); // setup/init -> OK
  }
  return sum / N;
}

static float measureACCurrentRMS() {
  float sumSquares = 0;
  for (int i = 0; i < AC_SAMPLES; i++) {
    int32_t adc = mcp2.readADC();
    float v = mcpToVoltage(adc, 1.0f, RESOLUTION_12_BIT);
    float realV = v / DIVISOR_GAIN;

    float i_inst = (realV - acsOffset) / ACS_SENS;
    sumSquares += i_inst * i_inst;

    // ✅ vTaskDelay sempre em ticks
    vTaskDelay(pdMS_TO_TICKS(AC_SAMPLE_DELAY_MS));
  }
  return sqrtf(sumSquares / (float)AC_SAMPLES);
}

static float measureVoltageRMS() {
  float sumSquares = 0;

  for (int i = 0; i < TRAFO_SAMPLES; i++) {
    int32_t adc = mcp1.readADC();
    float v_adc = mcpToVoltage(adc, 1.0f, RESOLUTION_MCP);

    float v_sec = (v_adc / DIVISOR_TRAFO_GAIN);
    sumSquares += v_sec * v_sec;

    // ✅ vTaskDelay sempre em ticks
    vTaskDelay(pdMS_TO_TICKS(TRAFO_SAMPLE_DELAY_MS));
  }

  if (sumSquares <= 1.0f) return 0.0f;

  float vrms_half = sqrtf(sumSquares / (float)TRAFO_SAMPLES) + 0.7f;
  float vrms_primary = vrms_half * TRAFO_RATIO * sqrtf(2.0f);
  return vrms_primary;
}

static void sensorsInitOrDie() {
  // I2C mais robusto (menos chance de travar e gerar WDT)
  I2C_1.begin(SDA1, SCL1, I2C_HZ);
  I2C_2.begin(SDA2, SCL2, I2C_HZ);

  // timeout do Wire em ms (evita travas longas)
  I2C_1.setTimeOut(50);
  I2C_2.setTimeOut(50);

  logf("[DBG] Iniciando sensores...");

  if (!mcp1.begin(0x68, &I2C_1)) {
    logf("[SENS] ERRO: MCP3421 (barramento 1) não encontrado.");
    while (1) delay(10);
  }
  if (!mcp2.begin(0x68, &I2C_2)) {
    logf("[SENS] ERRO: MCP3421 (barramento 2) não encontrado.");
    while (1) delay(10);
  }
  if (!bme.begin(0x76, &I2C_1)) {
    logf("[SENS] ERRO: BME280 não encontrado.");
    while (1) delay(10);
  }

  mcp1.setGain(GAIN_MCP);
  mcp2.setGain(GAIN_MCP);

  mcp1.setResolution(RESOLUTION_MCP);
  mcp2.setResolution(RESOLUTION_MCP);

  mcp1.setMode(MODE_MCP);
  mcp2.setMode(MODE_MCP);

  bme.setSampling(
    Adafruit_BME280::MODE_NORMAL,
    Adafruit_BME280::SAMPLING_X16,
    Adafruit_BME280::SAMPLING_NONE,
    Adafruit_BME280::SAMPLING_NONE,
    Adafruit_BME280::FILTER_OFF,
    Adafruit_BME280::STANDBY_MS_0_5
  );

  acsOffset = measureACSOffset();
  logf("[SENS] OK. ACS offset=%.3f", acsOffset);
  logf("[DBG] Sensores iniciados.");
}

static void sensorTask(void*) {
  measurement_t m;
  while (true) {
    // “respiro” entre medições pesadas reduz WDT e melhora WiFi/Async
    m.currentA = measureACCurrentRMS();
    vTaskDelay(pdMS_TO_TICKS(5));

    m.voltageV = measureVoltageRMS();
    vTaskDelay(pdMS_TO_TICKS(5));

    m.temperatureC = bme.readTemperature();

    xSemaphoreTake(g_dataMutex, portMAX_DELAY);
    g_latest = m;
    xSemaphoreGive(g_dataMutex);

    logf("[SENS] V=%.1fV I=%.3fA T=%.2fC", m.voltageV, m.currentA, m.temperatureC);

    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

// ============================
// HTTP helpers
// ============================
static bool httpGET(const char* url, int& outCode, String& outBody) {
  if (!ensureSTAConnected()) {
    outCode = -999;
    outBody = "SEM_INTERNET";
    return false;
  }
  HTTPClient http;
  http.setTimeout(12000);
  http.begin(url);
  outCode = http.GET();
  outBody = http.getString();
  http.end();
  return (outCode > 0);
}

static bool httpPOSTJson(const char* url, const String& payload, bool includeProvisionHeader, int& outCode, String& outBody) {
  if (!ensureSTAConnected()) {
    outCode = -999;
    outBody = "SEM_INTERNET";
    return false;
  }

  HTTPClient http;
  http.setTimeout(12000);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  if (includeProvisionHeader) {
    http.addHeader(PROVISION_HEADER, PROVISION_TOKEN);
  }

  outCode = http.POST(payload);
  outBody = http.getString();
  http.end();
  return (outCode > 0);
}

// ============================
// Backend: Login (proxy)
// ============================
static bool backendLogin(
  const String& email,
  const String& password,
  String& outUserId,
  String& outAccess,
  String& outRefresh,
  String& outErr
) {
  outUserId = "";
  outAccess = "";
  outRefresh = "";
  outErr = "";

  JsonDocument doc;
  doc["email"] = email;
  doc["password"] = password;

  String payload;
  serializeJson(doc, payload);

  int code = 0;
  String body;
  bool okNet = httpPOSTJson(AUTH_LOGIN_URL, payload, /*includeProvisionHeader=*/false, code, body);
  logf("[AUTH] POST /auth/login code=%d", code);

  if (!okNet) { outErr = "Sem internet. Configure o Wi-Fi no setup primeiro."; return false; }
  if (code != 200) { outErr = String("Falha no login. HTTP ") + code; return false; }

  JsonDocument resp;
  DeserializationError de = deserializeJson(resp, body);
  if (de) { outErr = "Resposta de login inválida (JSON)."; return false; }

  outAccess  = jsonStringOrEmpty(resp["access_token"]);
  outRefresh = jsonStringOrEmpty(resp["refresh_token"]);

  String uid = "";
  if (!resp["user"].isNull()) {
    JsonVariant user = resp["user"];
    uid = jsonStringOrEmpty(user["id"]);
    if (!uid.length()) uid = jsonStringOrEmpty(user["userId"]);
  }
  if (!uid.length()) { outErr = "Login OK, mas não consegui ler o userId."; return false; }

  outUserId = uid;
  return true;
}

// ============================
// Backend: Patios (proxy)
// ============================
static bool backendGetPatios(String& outJson, String& outErr) {
  int code = 0;
  String body;
  bool okNet = httpGET(PATIOS_PUBLIC_URL, code, body);

  if (!okNet) { outErr = "Sem internet para carregar os pátios."; return false; }
  if (code != 200) { outErr = String("Erro ao buscar pátios. HTTP ") + code; return false; }

  outJson = body;
  return true;
}

// ============================
// Backend: Provision
// ============================
static bool backendProvision(String& outMachineId, String& outErrFriendly) {
  // lê draft do NVS (sem spam)
  prefs.begin(NVS_NS, true);
  String machineKey   = nvsGetStringSafe(prefs, "machineKey", "");
  String patioId      = nvsGetStringSafe(prefs, "patioId", "");
  String manufacturer = nvsGetStringSafe(prefs, "manufacturer", "");
  String model        = nvsGetStringSafe(prefs, "model", "");
  String status       = nvsGetStringSafe(prefs, "status", "operante");

  String metaTag      = nvsGetStringSafe(prefs, "metaTag", "");
  String metaPowerKw  = nvsGetStringSafe(prefs, "metaPowerKw", "");
  String metaVoltNom  = nvsGetStringSafe(prefs, "metaVoltNom", "");
  String metaNotes    = nvsGetStringSafe(prefs, "metaNotes", "");
  prefs.end();

  if (!g_operatorUserId.length()) {
    outErrFriendly = "Você precisa fazer login (operador) antes de provisionar.";
    return false;
  }

  JsonDocument doc;
  doc["deviceId"] = g_deviceId;
  doc["machineKey"] = machineKey;
  doc["patioId"] = patioId;
  doc["manufacturer"] = manufacturer;
  doc["model"] = model;
  doc["status"] = status;
  doc["operatorUserId"] = g_operatorUserId;

  JsonObject meta = doc["meta"].to<JsonObject>();
  meta["tag"] = metaTag;
  meta["powerKw"] = metaPowerKw.length() ? metaPowerKw.toFloat() : 0.0f;
  meta["voltageNominal"] = metaVoltNom.length() ? metaVoltNom.toFloat() : 0.0f;
  meta["notes"] = metaNotes;

  doc["fwVersion"] = FW_VERSION;

  String payload;
  serializeJson(doc, payload);

  int code = 0;
  String body;
  bool okNet = httpPOSTJson(PROVISION_URL, payload, /*includeProvisionHeader=*/true, code, body);

  logf("[PROVISION] code=%d", code);

  if (!okNet) { outErrFriendly = "Sem internet. Confira o Wi-Fi."; return false; }
  if (code == 401) { outErrFriendly = "Token de provisionamento inválido (401)."; return false; }
  if (code == 409) { outErrFriendly = "Este device ou máquina já está pareado (409)."; return false; }
  if (code != 201) { outErrFriendly = String("Erro no provisionamento. HTTP ") + code; return false; }

  JsonDocument resp;
  if (deserializeJson(resp, body)) {
    outErrFriendly = "Provisionou, mas a resposta veio inválida (JSON).";
    return false;
  }

  // ✅ extrai machineId com segurança
  String mid = "";
  if (!resp["telemetry"].isNull()) {
    mid = jsonStringOrEmpty(resp["telemetry"]["machineId"]);
  }
  if (!mid.length()) {
    outErrFriendly = "Provisionou, mas não veio machineId.";
    return false;
  }

  outMachineId = mid;
  return true;
}

// ============================
// Telemetria Buffer + Backoff
// ============================
struct TelemetrySample {
  String machineId;
  float voltageV;
  float currentA;
  float temperatureC;
  uint32_t seq;
};

static TelemetrySample g_buf[TELEMETRY_BUFFER_SIZE];
static int g_bufHead = 0;
static int g_bufCount = 0;

static uint32_t g_backoffMs = 2000;
static const uint32_t BACKOFF_MAX_MS = 60000;

static void bufferPush(const TelemetrySample& s) {
  g_buf[g_bufHead] = s;
  g_bufHead = (g_bufHead + 1) % TELEMETRY_BUFFER_SIZE;
  if (g_bufCount < TELEMETRY_BUFFER_SIZE) g_bufCount++;
  else logf("[TEL] Buffer cheio: sobrescrevendo antigo.");
}

static bool bufferPopOldest(TelemetrySample& out) {
  if (g_bufCount <= 0) return false;
  int oldestIndex = (g_bufHead - g_bufCount);
  while (oldestIndex < 0) oldestIndex += TELEMETRY_BUFFER_SIZE;
  out = g_buf[oldestIndex];
  g_bufCount--;
  return true;
}

static void backoffOnFail() { g_backoffMs = min(g_backoffMs * 2, BACKOFF_MAX_MS); }
static void backoffOnSuccess() { g_backoffMs = 2000; }

static bool backendSendTelemetry(const TelemetrySample& s, int& outCode, String& outBody) {
  JsonDocument doc;
  doc["machineId"] = s.machineId;
  doc["voltageV"] = s.voltageV;
  doc["currentA"] = s.currentA;
  doc["temperatureC"] = s.temperatureC;
  doc["seq"] = s.seq;

  String payload;
  serializeJson(doc, payload);

  return httpPOSTJson(TELEMETRY_URL, payload, /*includeProvisionHeader=*/true, outCode, outBody);
}

static void telemetryTask(void*) {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org", "time.nist.gov", "time.google.com");

  uint32_t nextSendAt = millis() + TELEMETRY_PERIOD_MS;

  while (true) {
    if (g_provisioned && g_machineId.length() && WiFi.status() == WL_CONNECTED) {

      // 1) reenvio do buffer (no máximo 1 por ciclo para não travar)
      if (g_bufCount > 0) {
        TelemetrySample old;
        if (bufferPopOldest(old)) {
          int code = 0; String body;
          bool okNet = backendSendTelemetry(old, code, body);

          if (okNet && code == 201) {
            backoffOnSuccess();
            g_lastTelemetryAtIso = nowIsoIfAvailable();
            g_lastTelemetryHttp = code;
            logf("[TEL] Reenvio OK seq=%u", (unsigned)old.seq);
          } else {
            bufferPush(old);
            backoffOnFail();
            g_lastTelemetryHttp = code;
            logf("[TEL] Reenvio falhou code=%d backoff=%ums", code, (unsigned)g_backoffMs);
            vTaskDelay(pdMS_TO_TICKS(g_backoffMs));
          }

          // ✅ respiro extra após HTTP
          vTaskDelay(pdMS_TO_TICKS(10));
        }
      }

      // 2) envio periódico
      if ((int32_t)(millis() - nextSendAt) >= 0) {
        measurement_t m;
        xSemaphoreTake(g_dataMutex, portMAX_DELAY);
        m = g_latest;
        xSemaphoreGive(g_dataMutex);

        TelemetrySample s;
        s.machineId = g_machineId;
        s.voltageV = m.voltageV;
        s.currentA = m.currentA;
        s.temperatureC = m.temperatureC;
        s.seq = ++g_seq;

        int code = 0; String body;
        bool okNet = backendSendTelemetry(s, code, body);

        if (okNet && code == 201) {
          backoffOnSuccess();
          g_lastTelemetryAtIso = nowIsoIfAvailable();
          g_lastTelemetryHttp = code;
          logf("[TEL] OK seq=%u", (unsigned)s.seq);
          if ((s.seq % 20) == 0) nvsSaveSeq(g_seq);
        } else {
          bufferPush(s);
          backoffOnFail();
          g_lastTelemetryHttp = code;
          logf("[TEL] FAIL code=%d buffer=%d backoff=%ums", code, g_bufCount, (unsigned)g_backoffMs);
          vTaskDelay(pdMS_TO_TICKS(g_backoffMs));
        }

        nextSendAt = millis() + TELEMETRY_PERIOD_MS;

        // ✅ respiro extra após HTTP
        vTaskDelay(pdMS_TO_TICKS(10));
      }
    }

    vTaskDelay(pdMS_TO_TICKS(200));
  }
}

// ============================
// Web UI
// ============================
static String renderHomePage() {
  bool staConnected = (WiFi.status() == WL_CONNECTED);
  String mode = (WiFi.getMode() == WIFI_AP || WiFi.getMode() == WIFI_AP_STA) ? (staConnected ? "AP+STA" : "AP") : "STA";

  String ip = staConnected ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  String ssidShown = staConnected ? WiFi.SSID() : (g_apRunning ? g_apSsid : "");
  int rssi = staConnected ? WiFi.RSSI() : 0;

  uint32_t up = millis() / 1000;
  uint32_t heap = ESP.getFreeHeap();

  measurement_t m;
  xSemaphoreTake(g_dataMutex, portMAX_DELAY);
  m = g_latest;
  xSemaphoreGive(g_dataMutex);

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Rotorial • ESP32</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0}"
          "header{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)}"
          "main{padding:16px;max-width:980px;margin:0 auto;display:grid;gap:12px}"
          ".grid{display:grid;grid-template-columns:1fr;gap:12px}"
          "@media(min-width:900px){.grid{grid-template-columns:1fr 1fr}}"
          ".card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:14px}"
          ".kv{display:grid;grid-template-columns:140px 1fr;gap:6px 10px;font-size:13px}"
          ".btn{display:inline-block;text-decoration:none;color:#e6eefc;border:1px solid rgba(255,255,255,.14);"
          "background:rgba(255,255,255,.06);padding:10px 12px;border-radius:12px;font-weight:800}"
          ".btn:hover{background:rgba(255,255,255,.10)}"
          ".row{display:flex;gap:10px;flex-wrap:wrap}"
          ".pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);"
          "background:rgba(0,0,0,.25);font-size:12px}"
          "</style></head><body>";

  html += "<header><b>Rotorial • ESP32</b><div style='opacity:.75;font-size:12px'>Provisionamento e telemetria</div></header>";
  html += "<main><div class='grid'>";

  html += "<section class='card'><h3 style='margin:0 0 10px 0'>Situação do dispositivo</h3>";
  html += "<div class='kv'>";
  html += "<div>deviceId</div><div>" + htmlEscape(g_deviceId) + "</div>";
  html += "<div>fwVersion</div><div>" + String(FW_VERSION) + "</div>";
  html += "<div>Provisionado?</div><div>" + String(g_provisioned ? "Sim" : "Não") + "</div>";
  html += "<div>machineId</div><div>" + htmlEscape(g_machineId.length() ? g_machineId : "(vazio)") + "</div>";
  html += "<div>Operador (userId)</div><div>" + htmlEscape(g_operatorUserId.length() ? g_operatorUserId : "(não logado)") + "</div>";
  html += "<div>Wi-Fi modo</div><div>" + mode + "</div>";
  html += "<div>IP</div><div>" + ip + "</div>";
  html += "<div>SSID</div><div>" + htmlEscape(ssidShown) + "</div>";
  html += "<div>RSSI</div><div>" + String(rssi) + "</div>";
  html += "<div>Uptime</div><div>" + String(up) + "s</div>";
  html += "<div>Heap livre</div><div>" + String(heap) + "</div>";
  html += "<div>Última telemetria</div><div>" + htmlEscape(g_lastTelemetryAtIso.length() ? g_lastTelemetryAtIso : "(ainda não)") + "</div>";
  html += "<div>HTTP telemetria</div><div>" + String(g_lastTelemetryHttp) + "</div>";
  html += "</div>";

  html += "<div class='row' style='margin-top:12px'>";
  html += "<a class='btn' href='/setup'>Configurar / Provisionar</a>";
  html += "<a class='btn' href='/status'>Status (JSON)</a>";
  html += "<a class='btn' href='/logs'>Logs</a>";
  html += "<a class='btn' href='/factory-reset'>Factory reset</a>";
  html += "</div>";

  html += "<p style='opacity:.75;font-size:12px;margin-top:10px'>Backend fixo: " + String(BACKEND_BASE_URL) + "</p>";
  html += "</section>";

  html += "<section class='card'><h3 style='margin:0 0 10px 0'>Leituras (reais)</h3>";
  html += "<div class='pill'>Tensão: <b>" + String(m.voltageV, 1) + " V</b></div> ";
  html += "<div class='pill'>Corrente: <b>" + String(m.currentA, 3) + " A</b></div> ";
  html += "<div class='pill'>Temperatura: <b>" + String(m.temperatureC, 2) + " °C</b></div>";
  html += "<p style='opacity:.7;font-size:12px;margin-top:10px'>Esses valores são os mesmos usados no envio de telemetria.</p>";
  html += "</section>";

  html += "</div>";

  // Login prompt (somente se NÃO provisionado; melhora UX do setup)
  html += "<script>"
          "async function doLoginPrompt(){"
          "  if(localStorage.getItem('rt_userId')) return;"
          "  const email=prompt('Rotorial - Login\\n\\nDigite seu e-mail:');"
          "  if(!email) return;"
          "  const password=prompt('Digite sua senha:');"
          "  if(!password) return;"
          "  try{"
          "    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});"
          "    const j=await r.json();"
          "    if(!r.ok){alert(j.message||'Falha no login');return;}"
          "    localStorage.setItem('rt_userId', j.userId);"
          "    localStorage.setItem('rt_email', j.email||email);"
          "    alert('Login OK! Operador vinculado: '+j.userId);"
          "  }catch(e){alert('Erro de rede no login. Configure o Wi-Fi no setup.');}"
          "}"
          "const provisioned=" + String(g_provisioned ? "true" : "false") + ";"
          "if(!provisioned){ doLoginPrompt(); }"
          "</script>";

  html += "</main></body></html>";
  return html;
}

static String renderSetupFormPage(const String& msg = "") {
  prefs.begin(NVS_NS, true);
  String ssid = nvsGetStringSafe(prefs, "wifiSsid", "");
  String pass = nvsGetStringSafe(prefs, "wifiPass", "");
  String machineKey = nvsGetStringSafe(prefs, "machineKey", "");
  String patioId = nvsGetStringSafe(prefs, "patioId", "");
  String manufacturer = nvsGetStringSafe(prefs, "manufacturer", "");
  String model = nvsGetStringSafe(prefs, "model", "");
  String status = nvsGetStringSafe(prefs, "status", "operante");
  String metaTag = nvsGetStringSafe(prefs, "metaTag", "");
  String metaPowerKw = nvsGetStringSafe(prefs, "metaPowerKw", "");
  String metaVoltNom = nvsGetStringSafe(prefs, "metaVoltNom", "");
  String metaNotes = nvsGetStringSafe(prefs, "metaNotes", "");
  prefs.end();

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Setup • Rotorial</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:16px}"
          ".card{max-width:980px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          ".grid{display:grid;grid-template-columns:1fr;gap:12px}"
          "@media(min-width:900px){.grid{grid-template-columns:1fr 1fr}}"
          "label{font-size:12px;opacity:.8}"
          "input,select,textarea{width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e6eefc}"
          "textarea{min-height:80px}"
          ".btn{cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e6eefc;border-radius:12px;padding:10px 12px;font-weight:900}"
          ".btn.primary{background:rgba(43,213,118,.16);border-color:rgba(43,213,118,.35)}"
          ".btn.warn{background:rgba(255,189,46,.14);border-color:rgba(255,189,46,.35)}"
          ".row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}"
          ".msg{padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25);margin-bottom:12px}"
          "a{color:#9bd}"
          "</style></head><body>";

  html += "<div class='card'>";
  html += "<h2 style='margin:0 0 6px 0'>Configuração / Provisionamento</h2>";
  html += "<p style='opacity:.75;margin:0 0 12px 0'>deviceId: <b>" + htmlEscape(g_deviceId) + "</b> • fwVersion: <b>" + String(FW_VERSION) + "</b></p>";

  if (msg.length()) html += "<div class='msg'>" + htmlEscape(msg) + "</div>";

  html += "<div class='msg' id='loginBox' style='display:none'></div>";

  html += "<form method='POST' action='/setup/save'>";
  html += "<div class='grid'>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>1) Wi-Fi (para ter internet)</h3>";
  html += "<label>SSID</label><input name='ssid' value='" + htmlEscape(ssid) + "' required />";
  html += "<label>Senha</label><input name='pass' type='password' value='" + htmlEscape(pass) + "' />";
  html += "<p style='opacity:.7;font-size:12px'>Após salvar, o ESP tenta conectar em paralelo (AP + STA).</p>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>2) Operador e Pátio</h3>";
  html += "<label>Operador (userId)</label>"
          "<input id='operatorUserId' name='operatorUserId' value='" + htmlEscape(g_operatorUserId) + "' readonly />";

  html += "<label>Pátio</label>"
          "<select id='patioId' name='patioId' required>"
          "<option value=''>Carregando pátios...</option>"
          "</select>";

  html += "<p style='opacity:.7;font-size:12px'>O operador é obtido via login; o pátio vem do endpoint público.</p>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>3) Identificação da máquina</h3>";
  html += "<label>machineKey</label><input name='machineKey' value='" + htmlEscape(machineKey) + "' placeholder='MTR-001' required />";
  html += "<label>Fabricante</label><input name='manufacturer' value='" + htmlEscape(manufacturer) + "' placeholder='WEG' required />";
  html += "<label>Modelo</label><input name='model' value='" + htmlEscape(model) + "' placeholder='W22' required />";
  html += "<label>Status</label>"
          "<select name='status'>"
          "<option value='operante'" + String(status=="operante" ? " selected" : "") + ">Operante</option>"
          "<option value='inoperante'" + String(status=="inoperante" ? " selected" : "") + ">Inoperante</option>"
          "<option value='manutencao'" + String(status=="manutencao" ? " selected" : "") + ">Em manutenção</option>"
          "</select>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>4) Meta (opcional)</h3>";
  html += "<label>Tag</label><input name='metaTag' value='" + htmlEscape(metaTag) + "' placeholder='MTR-001' />";
  html += "<label>Potência (kW)</label><input name='metaPowerKw' value='" + htmlEscape(metaPowerKw) + "' placeholder='15' />";
  html += "<label>Tensão nominal (V)</label><input name='metaVoltNom' value='" + htmlEscape(metaVoltNom) + "' placeholder='220' />";
  html += "<label>Observações</label><textarea name='metaNotes' placeholder='Motor da linha 3'>" + htmlEscape(metaNotes) + "</textarea>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>Ações</h3>";
  html += "<div class='row'>";
  html += "<button class='btn warn' type='submit'>Salvar configuração</button>";
  html += "</form>";

  html += "<form method='POST' action='/setup/provision' style='margin:0'>";
  html += "<button class='btn primary' type='submit'>Provisionar no backend</button>";
  html += "</form>";

  html += "<a class='btn' href='/' style='text-decoration:none;display:inline-block'>Voltar</a>";
  html += "<button class='btn' type='button' onclick='trocarOperador()'>Trocar operador</button>";
  html += "</div>";
  html += "<p style='opacity:.7;font-size:12px;margin-top:10px'>Após provisionar, o setup será bloqueado.</p>";
  html += "</div>";

  html += "</div>"; // grid
  html += "</div>"; // card

  // JS: login + carregar patios
  html += "<script>"
          "const draftPatio='" + htmlEscape(patioId) + "';"
          "function showMsg(t){ const box=document.getElementById('loginBox'); box.style.display='block'; box.textContent=t; }"
          "async function loginSePreciso(){"
          "  if(localStorage.getItem('rt_userId')){"
          "    document.getElementById('operatorUserId').value=localStorage.getItem('rt_userId');"
          "    return;"
          "  }"
          "  const email=prompt('Rotorial - Login do Operador\\n\\nDigite seu e-mail:');"
          "  if(!email){ showMsg('Sem login: você ainda pode preencher Wi-Fi e salvar.'); return; }"
          "  const password=prompt('Digite sua senha:');"
          "  if(!password){ showMsg('Login cancelado.'); return; }"
          "  try{"
          "    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});"
          "    const j=await r.json();"
          "    if(!r.ok){ showMsg(j.message||'Falha no login'); return; }"
          "    localStorage.setItem('rt_userId', j.userId);"
          "    localStorage.setItem('rt_email', j.email||email);"
          "    document.getElementById('operatorUserId').value=j.userId;"
          "    showMsg('Login OK! Operador vinculado: ' + j.userId);"
          "  }catch(e){ showMsg('Erro de rede no login. Configure o Wi-Fi e salve.'); }"
          "}"
          "async function carregarPatios(){"
          "  try{"
          "    const r=await fetch('/api/patios',{cache:'no-store'});"
          "    const j=await r.json();"
          "    const sel=document.getElementById('patioId');"
          "    sel.innerHTML='';"
          "    if(!Array.isArray(j)){ sel.innerHTML='<option value=\"\">Falha ao carregar</option>'; return; }"
          "    sel.insertAdjacentHTML('beforeend','<option value=\"\">Selecione um pátio</option>');"
          "    for(const p of j){"
          "      const id=p.patioId||p.id||'';"
          "      const name=p.name||'Pátio';"
          "      const addr=p.address||'';"
          "      const opt=document.createElement('option');"
          "      opt.value=id;"
          "      opt.textContent= name + (addr?(' — '+addr):'');"
          "      if(draftPatio && id===draftPatio) opt.selected=true;"
          "      sel.appendChild(opt);"
          "    }"
          "  }catch(e){"
          "    const sel=document.getElementById('patioId');"
          "    sel.innerHTML='<option value=\"\">Sem internet para carregar pátios</option>';"
          "  }"
          "}"
          "async function trocarOperador(){"
          "  localStorage.removeItem('rt_userId');"
          "  localStorage.removeItem('rt_email');"
          "  await loginSePreciso();"
          "}"
          "loginSePreciso().then(carregarPatios);"
          "</script>";

  html += "</body></html>";
  return html;
}

static String renderLogsPage() {
  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Logs</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:16px}"
          ".card{max-width:980px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          ".btn{display:inline-block;text-decoration:none;color:#e6eefc;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);padding:10px 12px;border-radius:12px;font-weight:900;margin-right:8px}"
          "pre{margin-top:12px;font-size:12px;white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2 style='margin:0 0 10px 0'>Logs</h2>";
  html += "<a class='btn' href='/'>Voltar</a>";
  html += "<a class='btn' href='/logs/download'>Baixar</a>";
  html += "<pre>" + htmlEscape(getLogsText()) + "</pre>";
  html += "</div></body></html>";
  return html;
}

static String renderFactoryResetPage(const String& msg = "") {
  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Factory Reset</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:16px}"
          ".card{max-width:520px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          "input,button{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e6eefc}"
          "button{cursor:pointer;font-weight:900;margin-top:10px;background:rgba(255,80,80,.18);border-color:rgba(255,80,80,.35)}"
          ".msg{margin-bottom:10px;opacity:.9}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2 style='margin:0 0 10px 0'>Factory Reset</h2>";
  if (msg.length()) html += "<div class='msg'>" + htmlEscape(msg) + "</div>";
  html += "<p style='opacity:.8'>Isso apaga a configuração do dispositivo e reinicia.</p>";
  html += "<form method='POST' action='/factory-reset'>";
  html += "<input name='confirm' placeholder=\"Digite RESET para confirmar\" required />";
  html += "<button type='submit'>APAGAR E REINICIAR</button>";
  html += "</form>";
  html += "<p style='margin-top:10px'><a href='/'>Voltar</a></p>";
  html += "</div></body></html>";
  return html;
}

// ============================
// /status JSON (inclui leituras reais)
// ============================
static void handleStatusJson(AsyncWebServerRequest* req) {
  bool staConnected = (WiFi.status() == WL_CONNECTED);
  String mode = (WiFi.getMode() == WIFI_AP || WiFi.getMode() == WIFI_AP_STA) ? (staConnected ? "AP+STA" : "AP") : "STA";
  String ip = staConnected ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  int rssi = staConnected ? WiFi.RSSI() : 0;

  measurement_t m;
  xSemaphoreTake(g_dataMutex, portMAX_DELAY);
  m = g_latest;
  xSemaphoreGive(g_dataMutex);

  JsonDocument doc;
  doc["deviceId"] = g_deviceId;
  doc["fwVersion"] = FW_VERSION;
  doc["provisioned"] = g_provisioned;
  doc["backendUrl"] = BACKEND_BASE_URL;
  doc["machineId"] = g_machineId;
  doc["operatorUserId"] = g_operatorUserId;

  JsonObject wifi = doc["wifi"].to<JsonObject>();
  wifi["mode"] = mode;
  wifi["ip"] = ip;
  wifi["rssi"] = rssi;
  wifi["ssid"] = staConnected ? WiFi.SSID() : (g_apRunning ? g_apSsid : "");

  doc["lastTelemetryAt"] = g_lastTelemetryAtIso.length() ? g_lastTelemetryAtIso : "";
  doc["lastTelemetryHttp"] = g_lastTelemetryHttp;
  doc["uptimeS"] = (uint32_t)(millis() / 1000);
  doc["heapFree"] = (uint32_t)ESP.getFreeHeap();
  doc["seq"] = g_seq;

  JsonObject readings = doc["readings"].to<JsonObject>();
  readings["voltageV"] = m.voltageV;
  readings["currentA"] = m.currentA;
  readings["temperatureC"] = m.temperatureC;

  String out;
  serializeJson(doc, out);
  req->send(200, "application/json", out);
}

// ============================
// Rotas Web
// ============================
static void setupRoutes() {
  server.on("/", HTTP_GET, [](AsyncWebServerRequest* req) {
    req->send(200, "text/html; charset=utf-8", renderHomePage());
  });

  server.on("/status", HTTP_GET, [](AsyncWebServerRequest* req) {
    handleStatusJson(req);
  });

  server.on("/logs", HTTP_GET, [](AsyncWebServerRequest* req) {
    req->send(200, "text/html; charset=utf-8", renderLogsPage());
  });

  server.on("/logs/download", HTTP_GET, [](AsyncWebServerRequest* req) {
    String txt = getLogsText();
    AsyncWebServerResponse* res = req->beginResponse(200, "text/plain; charset=utf-8", txt);
    res->addHeader("Content-Disposition", "attachment; filename=\"rotorial-logs.txt\"");
    req->send(res);
  });

  // Setup
  server.on("/setup", HTTP_GET, [](AsyncWebServerRequest* req) {
    requireSetupSessionOrPinPage(req, "/setup");
    if (g_provisioned) return;
    if (!sessionValid(req)) return;
    req->send(200, "text/html; charset=utf-8", renderSetupFormPage());
  });

  // Auth PIN (web local)
  server.on("/setup/auth", HTTP_POST, [](AsyncWebServerRequest* req) {
    String pin  = req->hasParam("pin", true) ? req->getParam("pin", true)->value() : "";
    String next = req->hasParam("next", true) ? req->getParam("next", true)->value() : "/setup";
    pin.trim(); next.trim();

    if (!pinStillValid()) { req->send(401, "text/plain; charset=utf-8", "PIN expirou. Reinicie o ESP."); return; }
    if (pin != g_setupPin) { req->send(401, "text/plain; charset=utf-8", "PIN incorreto."); return; }

    g_setupSessionToken = randomToken8();
    g_setupSessionExpiresMs = millis() + SETUP_PIN_TTL_MS;

    AsyncWebServerResponse* res = req->beginResponse(302);
    res->addHeader("Location", next);
    String cookie = "rt_sess=" + g_setupSessionToken + "; Max-Age=600; Path=/; SameSite=Lax";
    res->addHeader("Set-Cookie", cookie);
    req->send(res);

    logf("[WEB] Sessão liberada (10 min).");
  });

  // Save form
  server.on("/setup/save", HTTP_POST, [](AsyncWebServerRequest* req) {
    requireSetupSessionOrPinPage(req, "/setup");
    if (g_provisioned) return;
    if (!sessionValid(req)) return;

    auto P = [&](const char* k)->String {
      return req->hasParam(k, true) ? req->getParam(k, true)->value() : "";
    };

    String ssid = P("ssid");
    String pass = P("pass");
    String machineKey = P("machineKey");
    String patioId = P("patioId");
    String manufacturer = P("manufacturer");
    String model = P("model");
    String status = P("status");
    String metaTag = P("metaTag");
    String metaPowerKw = P("metaPowerKw");
    String metaVoltNom = P("metaVoltNom");
    String metaNotes = P("metaNotes");

    nvsSaveWifiAndProvisionDraft(ssid, pass, machineKey, patioId, manufacturer, model, status, metaTag, metaPowerKw, metaVoltNom, metaNotes);

    ensureSTAConnected();

    req->send(200, "text/html; charset=utf-8", renderSetupFormPage("Configuração salva. Se o Wi-Fi estiver correto, você já pode Provisionar."));
  });

  // Provision
  server.on("/setup/provision", HTTP_POST, [](AsyncWebServerRequest* req) {
    requireSetupSessionOrPinPage(req, "/setup");
    if (g_provisioned) return;
    if (!sessionValid(req)) return;

    if (!ensureSTAConnected()) {
      req->send(200, "text/html; charset=utf-8", renderSetupFormPage("Sem internet. Confira SSID/senha do Wi-Fi e clique em Salvar novamente."));
      return;
    }

    String machineId, errMsg;
    if (!backendProvision(machineId, errMsg)) {
      req->send(200, "text/html; charset=utf-8", renderSetupFormPage("Falha ao provisionar: " + errMsg));
      return;
    }

    nvsMarkProvisioned(machineId);

    AsyncWebServerResponse* res = req->beginResponse(200, "text/html; charset=utf-8",
      "<h2>Sucesso!</h2>"
      "<p>Dispositivo provisionado e pronto para enviar telemetria.</p>"
      "<p>Reiniciando em 2s...</p>"
      "<p><a href='/'>Voltar</a></p>"
    );
    res->addHeader("Set-Cookie", "rt_sess=; Max-Age=0; Path=/");
    req->send(res);

    logf("[PROVISION] OK -> reboot.");
    delay(2000);
    ESP.restart();
  });

  // Factory reset (permitido mesmo provisionado, mas protegido)
  server.on("/factory-reset", HTTP_GET, [](AsyncWebServerRequest* req) {
    requireSensitiveSessionOrPinPage(req, "/factory-reset");
    if (!sessionValid(req)) return;
    req->send(200, "text/html; charset=utf-8", renderFactoryResetPage());
  });

  server.on("/factory-reset", HTTP_POST, [](AsyncWebServerRequest* req) {
    requireSensitiveSessionOrPinPage(req, "/factory-reset");
    if (!sessionValid(req)) return;

    String confirm = req->hasParam("confirm", true) ? req->getParam("confirm", true)->value() : "";
    confirm.trim();

    if (confirm != "RESET") {
      req->send(200, "text/html; charset=utf-8", renderFactoryResetPage("Confirmação inválida. Digite RESET."));
      return;
    }

    req->send(200, "text/html; charset=utf-8", "<h2>Resetando...</h2><p>Apagando NVS e reiniciando.</p>");
    delay(600);
    nvsFactoryReset();
    delay(300);
    ESP.restart();
  });

  // ============================
  // Proxy API: /api/login (JSON)
  // ============================
  auto* loginHandler = new AsyncCallbackJsonWebHandler("/api/login",
    [](AsyncWebServerRequest* request, JsonVariant& json) {
      JsonObject body = json.as<JsonObject>();
      String email = jsonStringOrEmpty(body["email"]);
      String password = jsonStringOrEmpty(body["password"]);

      email.trim();
      password.trim();

      if (!email.length() || !password.length()) {
        request->send(400, "application/json", "{\"message\":\"Informe email e senha\"}");
        return;
      }

      String userId, access, refresh, err;
      if (!backendLogin(email, password, userId, access, refresh, err)) {
        JsonDocument resp;
        resp["message"] = err;
        String out; serializeJson(resp, out);
        request->send(401, "application/json", out);
        return;
      }

      nvsSaveLogin(userId, access, refresh);

      JsonDocument resp;
      resp["userId"] = userId;
      resp["email"] = email;

      String out;
      serializeJson(resp, out);
      request->send(200, "application/json", out);
    }
  );
  server.addHandler(loginHandler);

  // ============================
  // Proxy API: /api/patios (GET)
  // ============================
  server.on("/api/patios", HTTP_GET, [](AsyncWebServerRequest* req) {
    String json, err;
    if (!backendGetPatios(json, err)) {
      JsonDocument resp;
      resp["message"] = err;
      String out; serializeJson(resp, out);
      req->send(503, "application/json", out);
      return;
    }
    req->send(200, "application/json", json);
  });

  server.onNotFound([](AsyncWebServerRequest* req) {
    req->send(404, "text/plain; charset=utf-8", "Rota não encontrada.");
  });
}

// ============================
// Boot
// ============================
void setup() {
  Serial.begin(115200);
  delay(200);

  g_dataMutex = xSemaphoreCreateMutex();
  if (!g_dataMutex) {
    Serial.println("ERRO: mutex");
    while (1) delay(10);
  }

  g_deviceId = makeDeviceIdFromMac();

  g_setupPin = random6Digits();
  g_setupPinExpiresMs = millis() + SETUP_PIN_TTL_MS;
  g_setupSessionToken = "";
  g_setupSessionExpiresMs = 0;

  logf("===== ROTORIAL BOOT =====");
  logf("deviceId=%s fw=%s", g_deviceId.c_str(), FW_VERSION);
  logf("setupPIN=%s (10 min)", g_setupPin.c_str());
  logf("=========================");

  nvsLoad();

  // Wi-Fi
  if (g_provisioned) {
    WiFi.mode(WIFI_STA);
    if (!ensureSTAConnected()) {
      // fallback: AP+STA para status/logs/factory reset
      startAP_andMaybeSTA();
    }
  } else {
    startAP_andMaybeSTA();
  }

  // Sensores
  sensorsInitOrDie();

  // Web
  setupRoutes();
  server.begin();
  logf("[WEB] server iniciado");

  // Tasks (stack maior para evitar WDT/stack overflow)
  xTaskCreatePinnedToCore(sensorTask, "sensor", 8192, nullptr, 2, nullptr, 0);
  xTaskCreatePinnedToCore(telemetryTask, "telemetry", 8192, nullptr, 1, nullptr, 1);
}

void loop() {
  vTaskDelay(portMAX_DELAY);
}
