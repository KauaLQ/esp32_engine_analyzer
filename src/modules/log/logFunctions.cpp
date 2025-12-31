#include "logFunctions.h"

void logf(const char* fmt, ...) {
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

String getLogsText() {
  String out;
  if (!g_logWrapped) {
    for (int i = 0; i < g_logPos; i++) out += g_logs[i] + "\n";
  } else {
    for (int i = g_logPos; i < LOG_MAX; i++) out += g_logs[i] + "\n";
    for (int i = 0; i < g_logPos; i++) out += g_logs[i] + "\n";
  }
  return out;
}

/*=====================================================================================*/

String makeDeviceIdFromMac() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char buf[32];
  snprintf(buf, sizeof(buf), "ROTORIAL-ESP32-%02X%02X%02X", mac[3], mac[4], mac[5]);
  return String(buf);
}

String makeApSsid() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char buf[32];
  snprintf(buf, sizeof(buf), "ROTORIAL-SETUP-%02X%02X", mac[4], mac[5]);
  return String(buf);
}

String makeApPass() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char buf[32];
  snprintf(buf, sizeof(buf), "rotorial%02X%02X%02X", mac[3], mac[4], mac[5]); // >= 8 chars
  return String(buf);
}