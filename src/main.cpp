// =========================================
// Rotorial ESP32 - Provisionamento + Telemetria
// main.cpp (Hackathon-ready)
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

#include "modules/globals.h"
#include "modules/log/logFunctions.h"
#include "modules/utils/utilsFunctions.h"
#include "modules/templates/pages.h"
#include "modules/nvs/nvsFunctions.h"
#include "modules/network/wifiFunctions.h"
#include "modules/http/httpFunctions.h"
#include "modules/http/routes/routes.h"
#include "modules/backend/backFunctions.h"

// Instância dos Sensores e do I2C
static TwoWire I2C_1 = TwoWire(0);
static TwoWire I2C_2 = TwoWire(1);
static Adafruit_MCP3421 mcp1; // tensão (trafo)
static Adafruit_MCP3421 mcp2; // corrente (ACS)
static Adafruit_BME280 bme;

// Telemetria Buffer + Backoff
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

static float acsOffset = 2.5f;

// Protótipos de funções auxiliares
static float mcpToVoltage(int32_t adc, float gain, mcp3421_resolution resolution);
static float measureACSOffset();
static float measureACCurrentRMS();
static float measureVoltageRMS();
static void sensorsInitOrDie();

static void bufferPush(const TelemetrySample& s);
static bool bufferPopOldest(TelemetrySample& out);
static void backoffOnFail();
static void backoffOnSuccess();
static bool backendSendTelemetry(const TelemetrySample& s, int& outCode, String& outBody);

// Task dos sensores
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

// Task de Telemetria
static void telemetryTask(void*) {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org", "time.nist.gov", "time.google.com");

  uint32_t nextSendAt = millis() + TELEMETRY_PERIOD_MS;

  while (true) {
    if (g_provisioned && g_machineId.length() && WiFi.status() == WL_CONNECTED) {

      // reenvio do buffer (no máximo 1 por ciclo para não travar)
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

          // respiro extra após HTTP
          vTaskDelay(pdMS_TO_TICKS(10));
        }
      }

      // envio periódico
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

        // respiro extra após HTTP
        vTaskDelay(pdMS_TO_TICKS(10));
      }
    }

    vTaskDelay(pdMS_TO_TICKS(200));
  }
}

// Boot
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

/*============================ SUPER LOOP VAZIO. TUDO RODA EM RTOS ============================*/
void loop() {
  vTaskDelay(portMAX_DELAY);
}

// ----------------------> Funções auxiliares de Telemetria Buffer e Backoff
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

// ----------------------> Funções auxiliares de Sensores
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