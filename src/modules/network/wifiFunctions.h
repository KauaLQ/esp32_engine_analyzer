#ifndef WIFI_FUNCTIONS_H
#define WIFI_FUNCTIONS_H

#include "modules/globals.h"
#include "modules/log/logFunctions.h"

void startAP_andMaybeSTA();
bool ensureSTAConnected(uint32_t timeoutMs = 15000);

#endif