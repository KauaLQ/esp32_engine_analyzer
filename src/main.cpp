// breakout: sda1 scl1 v+1 vcc gnd v+2 scl2 sda2 
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MCP3421.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

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
#define TRAFO_SAMPLES 100
#define TRAFO_RATIO (220.0 / 13.0)
#define DIVISOR_TRAFO_GAIN (1.0/11.0)
#define TRAFO_SAMPLE_DELAY 4

// definições do ADC externo
#define GAIN_MCP GAIN_1X
#define RESOLUTION_MCP RESOLUTION_12_BIT
#define MODE_MCP MODE_CONTINUOUS

Adafruit_MCP3421 mcp1;  // adc externo 1
Adafruit_MCP3421 mcp2;  // adc externo 2
Adafruit_BME280 bme;    // sensor de temperatura

TwoWire I2C_1 = TwoWire(0);
TwoWire I2C_2 = TwoWire(1);

// funções auxiliares
float mcpToVoltage(int32_t adc, float gain, uint8_t resolution);
float measureACSOffset();
float measureACCurrentRMS();
void printValuesBME();
float measureVoltageRMS();

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

  if (! bme.begin(0x76, &I2C_1)) {
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
}
    
void loop() {
    int32_t adc1 = mcp1.readADC();
    int32_t adc2 = mcp2.readADC();

    float v1 = mcpToVoltage(adc1, 1.0, RESOLUTION_MCP);
    float v2 = mcpToVoltage(adc2, 1.0, RESOLUTION_MCP);

    float realV1 = v1 / DIVISOR_TRAFO_GAIN;
    float realV2 = v2 / DIVISOR_GAIN;

    float currentRMS = measureACCurrentRMS();
    float voltageRMS = measureVoltageRMS();

    Serial.printf("MCP1: %.6f V -> %.1f V | MCP2: %.6f V -> %.3f A\n", realV1, voltageRMS, realV2, currentRMS);
    
    printValuesBME();
    delay(1000);
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

        delay(AC_SAMPLE_DELAY);
    }

    return sqrt(sumSquares / AC_SAMPLES);
}

float measureVoltageRMS() {
    float sumSquares = 0;

    for (int i = 0; i < TRAFO_SAMPLES; i++) {
        int32_t adc = mcp1.readADC();
        float v_adc = mcpToVoltage(adc, 1.0, RESOLUTION_MCP);

        // tensão após divisor (lado secundário do trafo)
        float v_sec = (v_adc / DIVISOR_TRAFO_GAIN) + 0.7;

        sumSquares += v_sec * v_sec;

        delay(TRAFO_SAMPLE_DELAY);
    }

    float vrms_half = sqrt(sumSquares / TRAFO_SAMPLES);

    // reconstrói a senoide original
    float vrms_primary = vrms_half * TRAFO_RATIO * sqrt(2.0);

    return vrms_primary;
}

void printValuesBME() {
    Serial.print("temperatura = ");
    Serial.print(bme.readTemperature());
    Serial.println(" *C");

    Serial.println();
}