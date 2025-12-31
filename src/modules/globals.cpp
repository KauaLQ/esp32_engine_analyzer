#include "globals.h"

AsyncWebServer server(80);
Preferences prefs;

String g_deviceId;
bool   g_provisioned = false;
String g_machineId;

String g_wifiSsid;
String g_wifiPass;

String g_operatorUserId;
String g_accessToken;
String g_refreshToken;

String g_apSsid;
String g_apPass;
bool   g_apRunning = false;

String g_setupPin;
uint32_t g_setupPinExpiresMs;
String g_setupSessionToken;
uint32_t g_setupSessionExpiresMs;

String g_lastTelemetryAtIso;
int    g_lastTelemetryHttp = 0;

uint32_t g_seq = 0;

// Log ring (UI logs)
String g_logs[LOG_MAX];
int g_logPos = 0;
bool g_logWrapped = false;

// RTOS
SemaphoreHandle_t g_dataMutex = NULL;

// Sensores
measurement_t g_latest;