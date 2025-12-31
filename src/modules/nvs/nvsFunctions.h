#ifndef NVS_FUNCTIONS_H
#define NVS_FUNCTIONS_H

#include "modules/globals.h"
#include "modules/log/logFunctions.h"

String nvsGetStringSafe(Preferences& p, const char* key, const String& def = "");
bool nvsGetBoolSafe(Preferences& p, const char* key, bool def = false);
uint32_t nvsGetUIntSafe(Preferences& p, const char* key, uint32_t def = 0);
void nvsLoad();
void nvsSaveWifiAndProvisionDraft(
  const String& ssid, const String& pass,
  const String& machineKey, const String& patioId,
  const String& manufacturer, const String& model,
  const String& status,
  const String& metaTag, const String& metaPowerKw,
  const String& metaVoltNom, const String& metaNotes
);
void nvsMarkProvisioned(const String& machineId);
void nvsSaveSeq(uint32_t seq);
void nvsSaveLogin(const String& userId, const String& accessToken, const String& refreshToken);
void nvsFactoryReset();

#endif