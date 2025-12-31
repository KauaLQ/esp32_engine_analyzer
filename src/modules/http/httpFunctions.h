#ifndef HTTP_FUNCTIONS_H
#define HTTP_FUNCTIONS_H

#include "modules/globals.h"
#include "modules/network/wifiFunctions.h"

bool httpGET(const char* url, int& outCode, String& outBody);
bool httpPOSTJson(const char* url, const String& payload, bool includeProvisionHeader, int& outCode, String& outBody);

#endif