// breakout MCP3421: sda1 scl1 v+1 vcc gnd v+2 scl2 sda2 
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MCP3421.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>

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
#define WIFI_SSID     "CLEUDO"
#define WIFI_PASSWORD "91898487"
#define API_URL "http://192.168.1.100:3080/api/measurements"

// definições do timestamp
#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC (-3 * 3600)
#define DAYLIGHT_OFFSET_SEC 0

// server local do esp
AsyncWebServer server(80);

Adafruit_MCP3421 mcp1;  // adc externo 1
Adafruit_MCP3421 mcp2;  // adc externo 2
Adafruit_BME280 bme;    // sensor de temperatura

TwoWire I2C_1 = TwoWire(0);
TwoWire I2C_2 = TwoWire(1);

typedef struct {
    float temperature;
    float current;
    float voltage;
    float vibration;
} measurement_t;

// utilitários do freeRTOS
QueueHandle_t measurementQueue;
EventGroupHandle_t systemEvents;
SemaphoreHandle_t dataMutex;
measurement_t latestMeasurement;
#define TIME_SYNC_OK_BIT (1 << 0)

// funções auxiliares
float mcpToVoltage(int32_t adc, float gain, uint8_t resolution);
float measureACSOffset();
float measureACCurrentRMS();
float measureVoltageRMS();
int sendMeasurements(float temperature, float current, float voltage, float vibration);

// Tasks RTOS
void timeTask(void *parameter);
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

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  measurementQueue = xQueueCreate(5, sizeof(measurement_t));

  if (measurementQueue == NULL) {
      Serial.println("Erro ao criar a fila!");
      while (1);
  }

  systemEvents = xEventGroupCreate();

  if (systemEvents == NULL) {
      Serial.println("Erro ao criar EventGroup!");
      while (1);
  }

  dataMutex = xSemaphoreCreateMutex();

  if (dataMutex == NULL) {
      Serial.println("Erro ao criar mutex!");
      while (1);
  }

  xTaskCreatePinnedToCore(timeTask, "Time Task", 2048, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(sensorTask, "Sensor Task", 4096, NULL, 2, NULL,0);
  xTaskCreatePinnedToCore(networkTask, "Network Task", 6144, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(webServerTask, "Web Server Task", 4096, NULL, 1, NULL, 1);
}

void timeTask(void *parameter) {
    configTime(
        GMT_OFFSET_SEC,
        DAYLIGHT_OFFSET_SEC,
        "pool.ntp.org",
        "time.nist.gov",
        "time.google.com"
    );

    struct tm timeinfo;

    while (true) {
        if (getLocalTime(&timeinfo)) {
            Serial.println("Horário sincronizado!");

            // Sinaliza para o sistema que o tempo está OK
            xEventGroupSetBits(systemEvents, TIME_SYNC_OK_BIT);

            vTaskDelete(NULL); // task cumpriu sua missão
        }

        Serial.println("Tentando sincronizar horário...");
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

void sensorTask(void *parameter) {
    measurement_t data;

    while (true) {
        data.current     = measureACCurrentRMS();
        data.voltage     = measureVoltageRMS();
        data.temperature = bme.readTemperature();
        data.vibration   = 0.87; // placeholder

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

    // Espera o tempo estar sincronizado
    Serial.println("[NETWORK] Aguardando sincronização do horário...");
    xEventGroupWaitBits(
        systemEvents,
        TIME_SYNC_OK_BIT,
        pdFALSE,   // não limpa o bit
        pdTRUE,    // espera todos os bits (só temos um)
        portMAX_DELAY
    );

    Serial.println("[NETWORK] Horário OK, iniciando envios!");

    while (true) {
        if (xQueueReceive(measurementQueue, &data, portMAX_DELAY)) {
            int httpResponseCode = sendMeasurements(data.temperature, data.current, data.voltage, data.vibration);

            Serial.printf("[CORE 1] Resposta HTTP: %d\n", httpResponseCode);
        }
    }
}

void webServerTask(void *parameter) {
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/html",
            "<h1>ESP32 Online</h1>"
            "<p>Servidor de configuracoes</p>"
        );
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
        doc["vibration"]   = data.vibration;

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

String getISOTimestamp() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        return "1970-01-01T00:00:00Z";
    }

    char buffer[25];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buffer);
}

int sendMeasurements(float temperature, float current, float voltage, float vibration) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi desconectado!");
        return -999;
    }

    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;

    doc["device_id"] = "motor_teste";
    doc["timestamp"] = getISOTimestamp();
    doc["temperature"] = temperature;
    doc["current"]     = current;
    doc["voltage"]     = voltage;
    doc["vibration"]   = vibration; // dado genérico

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.POST(payload);

    http.end();

    return httpResponseCode;
}