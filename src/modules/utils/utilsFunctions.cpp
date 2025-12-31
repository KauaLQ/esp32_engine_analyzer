#include "utilsFunctions.h"

// Utils
String htmlEscape(const String& s) {
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

String nowIsoIfAvailable() {
  time_t now = time(nullptr);
  if (now < 100000) return "";
  struct tm tm_utc;
  gmtime_r(&now, &tm_utc);
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tm_utc);
  return String(buf);
}

String random6Digits() {
  uint32_t r = esp_random();
  uint32_t pin = (r % 900000) + 100000;
  return String(pin);
}

String randomToken8() {
  uint32_t r = esp_random();
  char buf[16];
  snprintf(buf, sizeof(buf), "%08X", (unsigned)r);
  return String(buf);
}

bool pinStillValid() {
  return (millis() <= g_setupPinExpiresMs);
}

bool sessionValid(AsyncWebServerRequest* req) {
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
String jsonStringOrEmpty(JsonVariantConst v) {
  if (v.is<const char*>()) return String(v.as<const char*>());
  if (v.is<String>()) return v.as<String>();
  return String("");
}

// /status JSON (inclui leituras reais)
void handleStatusJson(AsyncWebServerRequest* req) {
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