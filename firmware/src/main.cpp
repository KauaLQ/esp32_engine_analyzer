// breakout MCP3421: sda1 scl1 v+1 vcc gnd v+2 scl2 sda2 
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MCP3421.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <Preferences.h>

#include "pages.h" // header auxiliar com páginas HTML

#define DEVICE_ID   "ROTORIAL-ESP32-1"
#define FW_VERSION  "1.0.0"

#define SCL1 9
#define SDA1 8
#define SCL2 7
#define SDA2 14

// relação divisiva para tensões ficarem dentro do range do MCP3421
#define DIVISOR_GAIN (1.0 / 3.0)

// definições do sensor de corrente
#define ACS_SENS 0.185        // V/A (modelo 5A)
#define AC_SAMPLES 100        // quantidade de amostras
#define AC_SAMPLE_DELAY 4     // ms (aprox. 240 SPS)
float acsOffset = 2.5;        // sem calibração o offset padrão é 2.5

// definições do trafo sensor de tensão
#define TRAFO_SAMPLES 120
#define TRAFO_RATIO (220.0 / 13.0)
#define DIVISOR_TRAFO_GAIN (1.0/11.0)
#define TRAFO_SAMPLE_DELAY 4

// definições do ADC externo
#define GAIN_MCP GAIN_1X
#define RESOLUTION_MCP RESOLUTION_12_BIT
#define MODE_MCP MODE_CONTINUOUS

// definições do wifi e API
#define DEF_WIFI_SSID       "CLEUDO"
#define DEF_WIFI_PASSWORD   "91898487"
#define AUTH_LOGIN_URL      "https://rotorial-backend.onrender.com/auth/login"
#define PATIOS_PUBLIC_URL   "https://rotorial-backend.onrender.com/patios/public"
#define PROVISION_URL       "https://rotorial-backend.onrender.com/provision"
#define TELEMETRY_URL       "https://rotorial-backend.onrender.com/telemetry"
#define PROVISION_HEADER    "x-provision-token"
#define PROVISION_TOKEN     "santoDeus@1"

// credenciais do usuário (armazenadas em RAM)
String userEmail = "";
String userPassword = "";
String accessToken  = "";
String refreshToken = "";
String userId       = "";
// dados selecionados
String selectedPatioId = "";
String selectedPatioName = "";
// identificação da máquina
String machineKey = "";
String manufacturer = "";
String model = "";
String machineStatus = "";
String machineTag = "";
float  machinePowerKw = 0.0;
float  nominalVoltage = 0.0;
String notes = "";
String machineId = "";   // vem da resposta do backend
// flags
bool isProvisioned = false;
bool isAuthenticated = false; // flag simples para indicar se está logado
// contador de telemetria
uint32_t telemetrySeq = 0;

// armazenar dados na NVS
Preferences nvs;
// server local do esp
AsyncWebServer server(80);
Adafruit_MCP3421 mcp1;  // adc externo 1
Adafruit_MCP3421 mcp2;  // adc externo 2
Adafruit_BME280 bme;    // sensor de temperatura
TwoWire I2C_1 = TwoWire(0);
TwoWire I2C_2 = TwoWire(1);

// Estrutura de envio de dados
typedef struct {
    float temperature;
    float current;
    float voltage;
} measurement_t;

// utilitários do freeRTOS
QueueHandle_t measurementQueue;
SemaphoreHandle_t dataMutex;
measurement_t latestMeasurement;

// funções auxiliares
void saveProvisionToNVS();
void loadProvisionFromNVS();
void clearProvisionNVS();
float mcpToVoltage(int32_t adc, float gain, uint8_t resolution);
float measureACSOffset();
float measureACCurrentRMS();
float measureVoltageRMS();
int sendTelemetry(float temperature, float current, float voltage);
bool authenticateUser(const String& email, const String& password);
int sendProvisionToBackend();

// Tasks RTOS
void sensorTask(void *parameter);
void networkTask(void *parameter);
void webServerTask(void *parameter);

void setup() {
  Serial.begin(115200); 
  while (!Serial) {
    delay(10); // Espera conexão da serial
  }

  I2C_2.begin(SDA2, SCL2, 400000); // Inicia o barramento I2C para o segundo MCP
  I2C_1.begin(SDA1, SCL1, 400000);

  // Inicia o MCP
  if (!mcp1.begin(0x68, &I2C_1)) { 
    Serial.println("Falha, nenhum chip MCP3421 encontrado no barramento 1");
    while (1) {
      delay(10);
    }
  }

  if (!mcp2.begin(0x68, &I2C_2)) { 
    Serial.println("Falha, nenhum chip MCP3421 encontrado no barramento 2");
    while (1) {
      delay(10);
    }
  }

  if (!bme.begin(0x76, &I2C_1)) {
    Serial.println("Não foi possível encontrar o sensor BME280!");
    while (1){
      delay(10);
    };
  }

  // Opções: GAIN_1X, GAIN_2X, GAIN_4X, GAIN_8X
  mcp1.setGain(GAIN_MCP);
  mcp2.setGain(GAIN_MCP);

  // Opções: RESOLUTION_12_BIT (240 SPS), RESOLUTION_14_BIT (60 SPS), RESOLUTION_16_BIT (15 SPS), RESOLUTION_18_BIT (3.75 SPS)
  mcp1.setResolution(RESOLUTION_MCP);
  mcp2.setResolution(RESOLUTION_MCP);

  // Opções: MODE_CONTINUOUS, MODE_ONE_SHOT
  mcp1.setMode(MODE_MCP);
  mcp2.setMode(MODE_MCP);

  bme.setSampling(
      Adafruit_BME280::MODE_NORMAL,
      Adafruit_BME280::SAMPLING_X16,  // Temperatura em alta precisão
      Adafruit_BME280::SAMPLING_NONE, // Pressão desativada
      Adafruit_BME280::SAMPLING_NONE, // Umidade desativada
      Adafruit_BME280::FILTER_OFF,    // Sem filtro → resposta mais rápida
      Adafruit_BME280::STANDBY_MS_0_5 // Alta taxa de atualização
  );

  acsOffset = measureACSOffset(); // calibração do zero do ACS712

  WiFi.begin(DEF_WIFI_SSID, DEF_WIFI_PASSWORD);
  Serial.print("Conectando ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  loadProvisionFromNVS();

  measurementQueue = xQueueCreate(5, sizeof(measurement_t));
  if (measurementQueue == NULL) {
      Serial.println("Erro ao criar a fila!");
      while (1);
  }

  dataMutex = xSemaphoreCreateMutex();
  if (dataMutex == NULL) {
      Serial.println("Erro ao criar mutex!");
      while (1);
  }

  xTaskCreatePinnedToCore(sensorTask, "Sensor Task", 4096, NULL, 2, NULL,0);
  xTaskCreatePinnedToCore(networkTask, "Network Task", 6144, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(webServerTask, "Web Server Task", 10240, NULL, 1, NULL, 1);
}

void sensorTask(void *parameter) {
    measurement_t data;

    while (true) {
        data.current     = measureACCurrentRMS();
        data.voltage     = measureVoltageRMS();
        data.temperature = bme.readTemperature();

        Serial.printf(
            "[CORE 0] V=%.1f | I=%.3f | T=%.2f\n",
            data.voltage,
            data.current,
            data.temperature
        );

        xSemaphoreTake(dataMutex, portMAX_DELAY);
        latestMeasurement = data;
        xSemaphoreGive(dataMutex);

        xQueueSend(measurementQueue, &data, portMAX_DELAY);

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void networkTask(void *parameter) {
    measurement_t data;

    // Espera provisionamento
    while (!isProvisioned || machineId.isEmpty()) {
        Serial.println("[NETWORK] Aguardando provisionamento...");
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    Serial.println("[NETWORK] Provisionado! Iniciando telemetria");

    while (true) {
        if (xQueueReceive(measurementQueue, &data, portMAX_DELAY)) {

            int code = sendTelemetry(
                data.temperature,
                data.current,
                data.voltage
            );

            if (code == 200 || code == 201) {
                Serial.println("[NETWORK] Telemetria enviada com sucesso");
            } else {
                Serial.printf("[NETWORK] Falha ao enviar (%d)\n", code);
            }
        }
    }
}

void webServerTask(void *parameter) {
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        if (!isAuthenticated) {
            request->send(200, "text/html", LOGIN_PAGE);
            return;
        }

        if (isProvisioned) {
            request->redirect("/status");
        } else {
            request->redirect("/provision");
        }
    });

    server.on("/login", HTTP_POST, [](AsyncWebServerRequest *request){
        if (!request->hasParam("email", true) || !request->hasParam("password", true)) {
            request->send(400, "text/plain", "Dados inválidos");
            return;
        }

        String email    = request->getParam("email", true)->value();
        String password = request->getParam("password", true)->value();

        Serial.println("[WEB LOGIN]");
        Serial.println("Email: " + email);

        bool authOk = authenticateUser(email, password);

        if (!authOk) {
            request->send(401, "text/html", LOGIN_ERROR_PAGE);
            return;
        }

        // salva credenciais localmente (se quiser)
        userEmail    = email;
        userPassword = password;
        isAuthenticated = true;

        request->redirect("/provision");
    });

    server.on("/provision", HTTP_GET, [](AsyncWebServerRequest *request){
        if (!isAuthenticated) {
            request->redirect("/");
            return;
        }
        if (isProvisioned) {
            request->redirect("/status");
            return;
        }
        request->send(200, "text/html", PROVISION_PAGE);
    });

    server.on("/provision", HTTP_POST,
    [](AsyncWebServerRequest *request){},
    NULL,
    [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t, size_t){

        JsonDocument doc;
        deserializeJson(doc, data);

        selectedPatioId = doc["patioId"].as<String>();
        machineKey      = doc["machineKey"].as<String>();
        manufacturer    = doc["manufacturer"].as<String>();
        model           = doc["model"].as<String>();
        machineStatus   = doc["status"].as<String>();
        machineTag      = doc["tag"].as<String>();
        machinePowerKw  = doc["power"].as<float>();
        nominalVoltage  = doc["voltage"].as<float>();
        notes           = doc["notes"].as<String>();

        int code = sendProvisionToBackend();

        if (code == 401) {
            request->send(401, "text/plain", "Token de provisionamento inválido ou inexistente");
            return;
        }
        if(code == 409) {
            request->send(409, "text/plain", "Já existe uma máquina com esta chave cadastrada");
            return;
        }
        
        if (code == 200 || code == 201) {
            isProvisioned = true;
            saveProvisionToNVS();
            // Em requisições AJAX (fetch), o redirecionamento deve ser feito pelo JavaScript
            request->send(200, "text/plain", "OK"); 
        }
        else {
            request->send(500, "text/plain", "Erro ao provisionar dispositivo");
        } 
    });

    server.on("/api/patios", HTTP_GET, [](AsyncWebServerRequest *request){
        HTTPClient http;
        http.begin(PATIOS_PUBLIC_URL);
        int code = http.GET();

        if (code != 200) {
            request->send(500, "text/plain", "Erro ao buscar pátios");
            http.end();
            return;
        }

        String response = http.getString();
        http.end();

        request->send(200, "application/json", response);
    });

    server.on("/api/user", HTTP_GET, [](AsyncWebServerRequest *request){
        JsonDocument doc;

        doc["authenticated"]    = isAuthenticated;
        doc["provisioned"]      = isProvisioned;
        doc["machineId"]        = machineId;
        doc["deviceId"]         = DEVICE_ID;
        doc["userId"]           = userId;
        doc["email"]            = userEmail;
        doc["role"]             = "admin"; // se quiser depois

        String response;
        serializeJson(doc, response);

        request->send(200, "application/json", response);
    });

    server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
        if (!isAuthenticated || !isProvisioned) {
            request->redirect("/");
            return;
        }

        String page = STATUS_PAGE;
        page.replace("%MACHINE_ID%", machineId);
        page.replace("%MODEL%", model);
        page.replace("%MANUFACTURER%", manufacturer);

        request->send(200, "text/html", page);
    });

    server.on("/reset", HTTP_POST, [](AsyncWebServerRequest *request){
        clearProvisionNVS();
        request->redirect("/provision");
    });

    server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request){
        measurement_t data;

        xSemaphoreTake(dataMutex, portMAX_DELAY);
        data = latestMeasurement;
        xSemaphoreGive(dataMutex);

        JsonDocument doc;
        doc["temperature"] = data.temperature;
        doc["current"]     = data.current;
        doc["voltage"]     = data.voltage;

        String response;
        serializeJson(doc, response);

        request->send(200, "application/json", response);
    });

    server.begin();

    Serial.println("[WEB] Servidor web iniciado");

    vTaskDelete(NULL); // async → não precisa loop
}

// ********************************* SUPER LOOP VAZIO > TUDO RODA EM RTOS *********************************
void loop() {
    vTaskDelay(portMAX_DELAY);
}

void saveProvisionToNVS() {
    nvs.begin("provision", false);

    nvs.putBool("prov", true);
    nvs.putString("machineId", machineId);
    nvs.putString("patioId", selectedPatioId);
    nvs.putString("machineKey", machineKey);
    nvs.putString("manufacturer", manufacturer);
    nvs.putString("model", model);
    nvs.putString("fw", FW_VERSION);

    nvs.end();

    Serial.println("[NVS] Provisionamento salvo");
}

void loadProvisionFromNVS() {
    nvs.begin("provision", true);

    isProvisioned = nvs.getBool("prov", false);

    if (isProvisioned) {
        machineId      = nvs.getString("machineId", "");
        selectedPatioId= nvs.getString("patioId", "");
        machineKey     = nvs.getString("machineKey", "");
        manufacturer   = nvs.getString("manufacturer", "");
        model          = nvs.getString("model", "");

        Serial.println("[NVS] Provisionamento carregado");
        Serial.println("Machine ID: " + machineId);
    }

    nvs.end();
}

void clearProvisionNVS() {
    nvs.begin("provision", false);
    nvs.clear();
    nvs.end();

    isProvisioned = false;
    machineId = "";

    Serial.println("[NVS] Provisionamento apagado");
}

float mcpToVoltage(int32_t adc, float gain, uint8_t resolution) {
    int32_t maxCounts;

    switch (resolution) {
        case RESOLUTION_12_BIT: maxCounts = 2048; break;
        case RESOLUTION_14_BIT: maxCounts = 8192; break;
        case RESOLUTION_16_BIT: maxCounts = 32768; break;
        case RESOLUTION_18_BIT: maxCounts = 131072; break;
        default: maxCounts = 131072;
    }

    return (adc * 2.048) / (maxCounts * gain);
}

float measureACSOffset() {
    const int N = 50;
    float sum = 0;

    for (int i = 0; i < N; i++) {
        int32_t adc = mcp2.readADC();
        float v = mcpToVoltage(adc, 1.0, RESOLUTION_MCP);
        sum += v / DIVISOR_GAIN;
        delay(20);
    }
    return sum / N;
}

float measureACCurrentRMS() {
    float sumSquares = 0;

    for (int i = 0; i < AC_SAMPLES; i++) {
        int32_t adc = mcp2.readADC();
        float v = mcpToVoltage(adc, 1.0, RESOLUTION_12_BIT);
        float realV = v / DIVISOR_GAIN;

        // corrente instantânea
        float i_inst = (realV - acsOffset) / ACS_SENS;

        sumSquares += i_inst * i_inst;

        vTaskDelay(AC_SAMPLE_DELAY);
    }

    return sqrt(sumSquares / AC_SAMPLES);
}

float measureVoltageRMS() {
    float sumSquares = 0;

    for (int i = 0; i < TRAFO_SAMPLES; i++) {
        int32_t adc = mcp1.readADC();
        float v_adc = mcpToVoltage(adc, 1.0, RESOLUTION_MCP);

        // tensão após divisor (lado secundário do trafo)
        float v_sec = (v_adc / DIVISOR_TRAFO_GAIN);

        sumSquares += v_sec * v_sec;

        vTaskDelay(TRAFO_SAMPLE_DELAY);
    }
    
    // evita erro associado ao offset de 0V
    if (sumSquares <= 1.0){
      return 0.0;
    }
    
    float vrms_half = sqrt(sumSquares / TRAFO_SAMPLES) + 0.7;

    // reconstrói a senoide original
    float vrms_primary = vrms_half * TRAFO_RATIO * sqrt(2.0);

    return vrms_primary;
}

int sendTelemetry(float temperature, float current, float voltage) {

    if (!isProvisioned || machineId.isEmpty()) {
        Serial.println("[TELEMETRY] Máquina não provisionada");
        return -1;
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[TELEMETRY] WiFi desconectado");
        return -2;
    }

    HTTPClient http;
    http.begin(TELEMETRY_URL);

    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + accessToken);

    JsonDocument doc;

    doc["machineId"]      = machineId;
    doc["voltageV"]       = voltage;
    doc["currentA"]       = current;
    doc["temperatureC"]   = temperature;
    doc["seq"]            = telemetrySeq++;

    String payload;
    serializeJson(doc, payload);

    Serial.println("[TELEMETRY] Enviando:");
    Serial.println(payload);

    int httpCode = http.POST(payload);
    String response = http.getString();

    Serial.printf("[TELEMETRY] HTTP %d\n", httpCode);
    Serial.println(response);

    http.end();

    return httpCode;
}

bool authenticateUser(const String& email, const String& password) {

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[AUTH] WiFi desconectado");
        return false;
    }

    HTTPClient http;
    http.begin(AUTH_LOGIN_URL);
    http.addHeader("Content-Type", "application/json");

    JsonDocument payload;
    payload["email"]    = email;
    payload["password"] = password;

    String body;
    serializeJson(payload, body);

    int httpCode = http.POST(body);

    if (httpCode <= 0) {
        Serial.printf("[AUTH] Erro HTTP: %d\n", httpCode);
        http.end();
        return false;
    }

    Serial.printf("[AUTH] HTTP %d\n", httpCode);

    if (httpCode != 200 && httpCode != 201) {
        http.end();
        return false;
    }

    String response = http.getString();
    http.end();

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, response);

    if (err) {
        Serial.println("[AUTH] Erro ao parsear JSON");
        return false;
    }

    // captura tokens
    accessToken  = doc["accessToken"].as<String>();
    refreshToken = doc["refreshToken"].as<String>();

    // captura user.id
    userId = doc["user"]["id"].as<String>();

    Serial.println("[AUTH] Login OK");
    Serial.println("User ID: " + userId);

    return true;
}

int sendProvisionToBackend() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[PROVISION] WiFi desconectado");
        return -1;
    }

    HTTPClient http;
    http.begin(PROVISION_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader(PROVISION_HEADER, PROVISION_TOKEN);

    JsonDocument doc;

    doc["deviceId"]        = DEVICE_ID;
    doc["machineKey"]      = machineKey;
    doc["patioId"]         = selectedPatioId;
    doc["manufacturer"]    = manufacturer;
    doc["model"]           = model;
    doc["status"]          = machineStatus;
    doc["operatorUserId"]  = userId;
    doc["fwVersion"]       = FW_VERSION;

    JsonObject meta = doc.createNestedObject("meta");
    meta["tag"]             = machineTag;
    meta["powerKw"]         = machinePowerKw;
    meta["voltageNominal"]  = nominalVoltage;
    meta["notes"]           = notes;

    String payload;
    serializeJson(doc, payload);

    Serial.println("[PROVISION] Enviando JSON:");
    Serial.println(payload);

    int httpCode = http.POST(payload);
    String response = http.getString();

    Serial.printf("[PROVISION] HTTP %d\n", httpCode);
    Serial.println("[PROVISION] Resposta:");
    Serial.println(response);

    http.end();

    if (httpCode != 200 && httpCode != 201) {
        return httpCode;
    }

    JsonDocument resp;
    if (deserializeJson(resp, response)) {
        Serial.println("[PROVISION] Erro ao parsear resposta");
        return -999;
    }

    machineId = resp["machine"]["id"].as<String>();

    Serial.println("[PROVISION] Provisionamento concluído!");
    Serial.println("Machine ID: " + machineId);

    return httpCode;
}