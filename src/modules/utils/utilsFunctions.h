#ifndef UTILS_FUNCTIONS_H
#define UTILS_FUNCTIONS_H

#include "modules/globals.h"

String htmlEscape(const String& s);
String nowIsoIfAvailable();
String random6Digits();
String randomToken8();
bool pinStillValid();
bool sessionValid(AsyncWebServerRequest* req);

String jsonStringOrEmpty(JsonVariantConst v);
void handleStatusJson(AsyncWebServerRequest* req);

#endif