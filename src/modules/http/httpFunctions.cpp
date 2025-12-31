#include "httpFunctions.h"

// HTTP helpers
bool httpGET(const char* url, int& outCode, String& outBody) {
  if (!ensureSTAConnected()) {
    outCode = -999;
    outBody = "SEM_INTERNET";
    return false;
  }
  HTTPClient http;
  http.setTimeout(12000);
  http.begin(url);
  outCode = http.GET();
  outBody = http.getString();
  http.end();
  return (outCode > 0);
}

bool httpPOSTJson(const char* url, const String& payload, bool includeProvisionHeader, int& outCode, String& outBody) {
  if (!ensureSTAConnected()) {
    outCode = -999;
    outBody = "SEM_INTERNET";
    return false;
  }

  HTTPClient http;
  http.setTimeout(12000);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  if (includeProvisionHeader) {
    http.addHeader(PROVISION_HEADER, PROVISION_TOKEN);
  }

  outCode = http.POST(payload);
  outBody = http.getString();
  http.end();
  return (outCode > 0);
}