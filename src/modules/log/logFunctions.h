#ifndef LOG_FUNCTIONS_H
#define LOG_FUNCTIONS_H

#include "modules/globals.h"

void logf(const char* fmt, ...);
String getLogsText();

String makeDeviceIdFromMac();
String makeApSsid();
String makeApPass();

#endif