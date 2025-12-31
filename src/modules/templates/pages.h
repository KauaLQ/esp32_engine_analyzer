#ifndef PAGES_H
#define PAGES_H

#include "modules/globals.h"
#include "modules/utils/utilsFunctions.h"
#include "modules/nvs/nvsFunctions.h"
#include "modules/log/logFunctions.h"

void sendSetupBlocked(AsyncWebServerRequest* req);
void requireSetupSessionOrPinPage(AsyncWebServerRequest* req, const String& nextPath);
void requireSensitiveSessionOrPinPage(AsyncWebServerRequest* req, const String& nextPath);
String renderHomePage();
String renderSetupFormPage(const String& msg = "");
String renderLogsPage();
String renderFactoryResetPage(const String& msg = "");

#endif