//
// Created by Gabriel Chaves on 30/12/25.
//

#ifndef ESP32_ENGINE_ANALYZER_TYPES_H
#define ESP32_ENGINE_ANALYZER_TYPES_H

struct Measurement {
    float temperature = 0;
    float current = 0;
    float voltage = 0;
    float vibration = 0;
};

#endif //ESP32_ENGINE_ANALYZER_TYPES_H