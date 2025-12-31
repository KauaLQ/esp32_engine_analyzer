#ifndef GLOBALS_H
#define GLOBALS_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <time.h>
#include <math.h>

#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <AsyncJson.h>

// BACKEND FIXO
#define BACKEND_BASE_URL   "https://hackaton-rotorial.onrender.com"
#define PROVISION_URL      "https://hackaton-rotorial.onrender.com/provision"
#define TELEMETRY_URL      "https://hackaton-rotorial.onrender.com/telemetry"

// NOVOS ENDPOINTS
#define AUTH_LOGIN_URL     "https://hackaton-rotorial.onrender.com/auth/login"
#define PATIOS_PUBLIC_URL  "https://hackaton-rotorial.onrender.com/patios/public"

// TOKEN FIXO
#define PROVISION_HEADER   "x-provision-token"
#define PROVISION_TOKEN    "santoDeus@1"

// FW E TIMINGS
#define FW_VERSION              "1.0.0"
#define SETUP_PIN_TTL_MS        (10UL * 60UL * 1000UL)
#define TELEMETRY_PERIOD_MS     10UL * 1000UL
#define TELEMETRY_BUFFER_SIZE   20

// NTP (Brasil - Fortaleza UTC-3)
#define GMT_OFFSET_SEC          -3 * 3600
#define DAYLIGHT_OFFSET_SEC     0

// I2C / MCP3421
#define GAIN_MCP          GAIN_1X
#define RESOLUTION_MCP    RESOLUTION_12_BIT
#define MODE_MCP          MODE_CONTINUOUS
#define I2C_HZ            100000

// PINOS / I2C (do seu hardware)
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

// Log ring (UI logs)
#define LOG_MAX 140

// NVS Namespace
#define NVS_NS "rotorial"

/*====================================== ESTRUTURAS ======================================*/
// RTOS / Sensores
typedef struct {
  float temperatureC;
  float currentA;
  float voltageV;
} measurement_t;

/*================================= VARIÁVEIS DE ESTADO =================================*/
// Web / NVS / Estado
extern AsyncWebServer server;
extern Preferences prefs;

extern String g_deviceId;
extern bool   g_provisioned;
extern String g_machineId;

extern String g_wifiSsid;
extern String g_wifiPass;

extern String g_operatorUserId;
extern String g_accessToken;
extern String g_refreshToken;

extern String g_apSsid;
extern String g_apPass;
extern bool   g_apRunning;

extern String g_setupPin;
extern uint32_t g_setupPinExpiresMs;
extern String g_setupSessionToken;
extern uint32_t g_setupSessionExpiresMs;

extern String g_lastTelemetryAtIso;
extern int    g_lastTelemetryHttp;

extern uint32_t g_seq;

// Log ring (UI logs)
extern String g_logs[LOG_MAX];
extern int g_logPos;
extern bool g_logWrapped;

// RTOS
extern SemaphoreHandle_t g_dataMutex;

// Sensores
extern measurement_t g_latest;

#endif