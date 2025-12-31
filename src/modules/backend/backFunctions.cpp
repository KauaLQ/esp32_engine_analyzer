#include "backFunctions.h"

// Backend: Login (proxy)
bool backendLogin(
  const String& email,
  const String& password,
  String& outUserId,
  String& outAccess,
  String& outRefresh,
  String& outErr
) {
  outUserId = "";
  outAccess = "";
  outRefresh = "";
  outErr = "";

  JsonDocument doc;
  doc["email"] = email;
  doc["password"] = password;

  String payload;
  serializeJson(doc, payload);

  int code = 0;
  String body;
  bool okNet = httpPOSTJson(AUTH_LOGIN_URL, payload, /*includeProvisionHeader=*/false, code, body);
  logf("[AUTH] POST /auth/login code=%d", code);

  if (!okNet) { outErr = "Sem internet. Configure o Wi-Fi no setup primeiro."; return false; }
  if (code != 200) { outErr = String("Falha no login. HTTP ") + code; return false; }

  JsonDocument resp;
  DeserializationError de = deserializeJson(resp, body);
  if (de) { outErr = "Resposta de login inválida (JSON)."; return false; }

  outAccess  = jsonStringOrEmpty(resp["access_token"]);
  outRefresh = jsonStringOrEmpty(resp["refresh_token"]);

  String uid = "";
  if (!resp["user"].isNull()) {
    JsonVariant user = resp["user"];
    uid = jsonStringOrEmpty(user["id"]);
    if (!uid.length()) uid = jsonStringOrEmpty(user["userId"]);
  }
  if (!uid.length()) { outErr = "Login OK, mas não consegui ler o userId."; return false; }

  outUserId = uid;
  return true;
}

// Backend: Patios (proxy)
bool backendGetPatios(String& outJson, String& outErr) {
  int code = 0;
  String body;
  bool okNet = httpGET(PATIOS_PUBLIC_URL, code, body);

  if (!okNet) { outErr = "Sem internet para carregar os pátios."; return false; }
  if (code != 200) { outErr = String("Erro ao buscar pátios. HTTP ") + code; return false; }

  outJson = body;
  return true;
}

// Backend: Provision
bool backendProvision(String& outMachineId, String& outErrFriendly) {
  // lê draft do NVS (sem spam)
  prefs.begin(NVS_NS, true);
  String machineKey   = nvsGetStringSafe(prefs, "machineKey", "");
  String patioId      = nvsGetStringSafe(prefs, "patioId", "");
  String manufacturer = nvsGetStringSafe(prefs, "manufacturer", "");
  String model        = nvsGetStringSafe(prefs, "model", "");
  String status       = nvsGetStringSafe(prefs, "status", "operante");

  String metaTag      = nvsGetStringSafe(prefs, "metaTag", "");
  String metaPowerKw  = nvsGetStringSafe(prefs, "metaPowerKw", "");
  String metaVoltNom  = nvsGetStringSafe(prefs, "metaVoltNom", "");
  String metaNotes    = nvsGetStringSafe(prefs, "metaNotes", "");
  prefs.end();

  if (!g_operatorUserId.length()) {
    outErrFriendly = "Você precisa fazer login (operador) antes de provisionar.";
    return false;
  }

  JsonDocument doc;
  doc["deviceId"] = g_deviceId;
  doc["machineKey"] = machineKey;
  doc["patioId"] = patioId;
  doc["manufacturer"] = manufacturer;
  doc["model"] = model;
  doc["status"] = status;
  doc["operatorUserId"] = g_operatorUserId;

  JsonObject meta = doc["meta"].to<JsonObject>();
  meta["tag"] = metaTag;
  meta["powerKw"] = metaPowerKw.length() ? metaPowerKw.toFloat() : 0.0f;
  meta["voltageNominal"] = metaVoltNom.length() ? metaVoltNom.toFloat() : 0.0f;
  meta["notes"] = metaNotes;

  doc["fwVersion"] = FW_VERSION;

  String payload;
  serializeJson(doc, payload);

  int code = 0;
  String body;
  bool okNet = httpPOSTJson(PROVISION_URL, payload, /*includeProvisionHeader=*/true, code, body);

  logf("[PROVISION] code=%d", code);

  if (!okNet) { outErrFriendly = "Sem internet. Confira o Wi-Fi."; return false; }
  if (code == 401) { outErrFriendly = "Token de provisionamento inválido (401)."; return false; }
  if (code == 409) { outErrFriendly = "Este device ou máquina já está pareado (409)."; return false; }
  if (code != 201) { outErrFriendly = String("Erro no provisionamento. HTTP ") + code; return false; }

  JsonDocument resp;
  if (deserializeJson(resp, body)) {
    outErrFriendly = "Provisionou, mas a resposta veio inválida (JSON).";
    return false;
  }

  // extrai machineId com segurança
  String mid = "";
  if (!resp["telemetry"].isNull()) {
    mid = jsonStringOrEmpty(resp["telemetry"]["machineId"]);
  }
  if (!mid.length()) {
    outErrFriendly = "Provisionou, mas não veio machineId.";
    return false;
  }

  outMachineId = mid;
  return true;
}