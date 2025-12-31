#include "nvsFunctions.h"

// NVS (sem spam NOT_FOUND)
String nvsGetStringSafe(Preferences& p, const char* key, const String& def) {
  if (!p.isKey(key)) return def;
  return p.getString(key, def);
}
bool nvsGetBoolSafe(Preferences& p, const char* key, bool def) {
  if (!p.isKey(key)) return def;
  return p.getBool(key, def);
}
uint32_t nvsGetUIntSafe(Preferences& p, const char* key, uint32_t def) {
  if (!p.isKey(key)) return def;
  return p.getUInt(key, def);
}

void nvsLoad() {
  prefs.begin(NVS_NS, true);

  g_provisioned  = nvsGetBoolSafe(prefs, "provisioned", false);
  g_machineId    = nvsGetStringSafe(prefs, "machineId", "");
  g_wifiSsid     = nvsGetStringSafe(prefs, "wifiSsid", "");
  g_wifiPass     = nvsGetStringSafe(prefs, "wifiPass", "");
  g_seq          = nvsGetUIntSafe(prefs, "seq", 0);

  g_operatorUserId = nvsGetStringSafe(prefs, "operatorUserId", "");
  g_accessToken    = nvsGetStringSafe(prefs, "accessToken", "");
  g_refreshToken   = nvsGetStringSafe(prefs, "refreshToken", "");

  prefs.end();

  logf("[NVS] provisioned=%d machineId=%s wifi=%s seq=%u operatorUserId=%s",
       g_provisioned ? 1 : 0,
       g_machineId.c_str(),
       g_wifiSsid.c_str(),
       (unsigned)g_seq,
       g_operatorUserId.c_str());
}

void nvsSaveWifiAndProvisionDraft(
  const String& ssid, const String& pass,
  const String& machineKey, const String& patioId,
  const String& manufacturer, const String& model,
  const String& status,
  const String& metaTag, const String& metaPowerKw,
  const String& metaVoltNom, const String& metaNotes
) {
  prefs.begin(NVS_NS, false);

  prefs.putString("wifiSsid", ssid);
  prefs.putString("wifiPass", pass);

  prefs.putString("machineKey", machineKey);
  prefs.putString("patioId", patioId);
  prefs.putString("manufacturer", manufacturer);
  prefs.putString("model", model);
  prefs.putString("status", status);

  // operatorUserId vem do login, não do form
  prefs.putString("operatorUserId", g_operatorUserId);

  prefs.putString("metaTag", metaTag);
  prefs.putString("metaPowerKw", metaPowerKw);
  prefs.putString("metaVoltNom", metaVoltNom);
  prefs.putString("metaNotes", metaNotes);

  prefs.putBool("provisioned", false);
  prefs.putString("machineId", "");

  prefs.end();

  g_wifiSsid = ssid;
  g_wifiPass = pass;

  logf("[NVS] Draft salvo (Wi-Fi + provision).");
}

void nvsMarkProvisioned(const String& machineId) {
  prefs.begin(NVS_NS, false);
  prefs.putBool("provisioned", true);
  prefs.putString("machineId", machineId);
  prefs.end();

  g_provisioned = true;
  g_machineId = machineId;
  logf("[NVS] Provisionado! machineId=%s", g_machineId.c_str());
}

void nvsSaveSeq(uint32_t seq) {
  prefs.begin(NVS_NS, false);
  prefs.putUInt("seq", seq);
  prefs.end();
  g_seq = seq;
}

void nvsSaveLogin(const String& userId, const String& accessToken, const String& refreshToken) {
  prefs.begin(NVS_NS, false);
  prefs.putString("operatorUserId", userId);
  prefs.putString("accessToken", accessToken);
  prefs.putString("refreshToken", refreshToken);
  prefs.end();

  g_operatorUserId = userId;
  g_accessToken = accessToken;
  g_refreshToken = refreshToken;

  logf("[AUTH] Login OK. operatorUserId=%s (tokens salvos no NVS, não expostos)", userId.c_str());
}

void nvsFactoryReset() {
  prefs.begin(NVS_NS, false);
  prefs.clear();
  prefs.end();
  logf("[NVS] Factory reset: namespace rotorial limpo.");
}