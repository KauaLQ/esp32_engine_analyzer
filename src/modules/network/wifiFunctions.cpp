#include "wifiFunctions.h"

// Wi-Fi (AP + STA para melhor UX)
void startAP_andMaybeSTA() {
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
bool ensureSTAConnected(uint32_t timeoutMs) {
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