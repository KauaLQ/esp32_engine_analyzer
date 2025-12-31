#include "routes.h"

// ============================
// Rotas Web
// ============================
void setupRoutes() {
  server.on("/", HTTP_GET, [](AsyncWebServerRequest* req) {
    req->send(200, "text/html; charset=utf-8", renderHomePage());
  });

  server.on("/status", HTTP_GET, [](AsyncWebServerRequest* req) {
    handleStatusJson(req);
  });

  server.on("/logs", HTTP_GET, [](AsyncWebServerRequest* req) {
    req->send(200, "text/html; charset=utf-8", renderLogsPage());
  });

  server.on("/logs/download", HTTP_GET, [](AsyncWebServerRequest* req) {
    String txt = getLogsText();
    AsyncWebServerResponse* res = req->beginResponse(200, "text/plain; charset=utf-8", txt);
    res->addHeader("Content-Disposition", "attachment; filename=\"rotorial-logs.txt\"");
    req->send(res);
  });

  // Setup
  server.on("/setup", HTTP_GET, [](AsyncWebServerRequest* req) {
    requireSetupSessionOrPinPage(req, "/setup");
    if (g_provisioned) return;
    if (!sessionValid(req)) return;
    req->send(200, "text/html; charset=utf-8", renderSetupFormPage());
  });

  // Auth PIN (web local)
  server.on("/setup/auth", HTTP_POST, [](AsyncWebServerRequest* req) {
    String pin  = req->hasParam("pin", true) ? req->getParam("pin", true)->value() : "";
    String next = req->hasParam("next", true) ? req->getParam("next", true)->value() : "/setup";
    pin.trim(); next.trim();

    if (!pinStillValid()) { req->send(401, "text/plain; charset=utf-8", "PIN expirou. Reinicie o ESP."); return; }
    if (pin != g_setupPin) { req->send(401, "text/plain; charset=utf-8", "PIN incorreto."); return; }

    g_setupSessionToken = randomToken8();
    g_setupSessionExpiresMs = millis() + SETUP_PIN_TTL_MS;

    AsyncWebServerResponse* res = req->beginResponse(302);
    res->addHeader("Location", next);
    String cookie = "rt_sess=" + g_setupSessionToken + "; Max-Age=600; Path=/; SameSite=Lax";
    res->addHeader("Set-Cookie", cookie);
    req->send(res);

    logf("[WEB] Sessão liberada (10 min).");
  });

  // Save form
  server.on("/setup/save", HTTP_POST, [](AsyncWebServerRequest* req) {
    requireSetupSessionOrPinPage(req, "/setup");
    if (g_provisioned) return;
    if (!sessionValid(req)) return;

    auto P = [&](const char* k)->String {
      return req->hasParam(k, true) ? req->getParam(k, true)->value() : "";
    };

    String ssid = P("ssid");
    String pass = P("pass");
    String machineKey = P("machineKey");
    String patioId = P("patioId");
    String manufacturer = P("manufacturer");
    String model = P("model");
    String status = P("status");
    String metaTag = P("metaTag");
    String metaPowerKw = P("metaPowerKw");
    String metaVoltNom = P("metaVoltNom");
    String metaNotes = P("metaNotes");

    nvsSaveWifiAndProvisionDraft(ssid, pass, machineKey, patioId, manufacturer, model, status, metaTag, metaPowerKw, metaVoltNom, metaNotes);

    ensureSTAConnected();

    req->send(200, "text/html; charset=utf-8", renderSetupFormPage("Configuração salva. Se o Wi-Fi estiver correto, você já pode Provisionar."));
  });

  // Provision
  server.on("/setup/provision", HTTP_POST, [](AsyncWebServerRequest* req) {
    requireSetupSessionOrPinPage(req, "/setup");
    if (g_provisioned) return;
    if (!sessionValid(req)) return;

    if (!ensureSTAConnected()) {
      req->send(200, "text/html; charset=utf-8", renderSetupFormPage("Sem internet. Confira SSID/senha do Wi-Fi e clique em Salvar novamente."));
      return;
    }

    String machineId, errMsg;
    if (!backendProvision(machineId, errMsg)) {
      req->send(200, "text/html; charset=utf-8", renderSetupFormPage("Falha ao provisionar: " + errMsg));
      return;
    }

    nvsMarkProvisioned(machineId);

    AsyncWebServerResponse* res = req->beginResponse(200, "text/html; charset=utf-8",
      "<h2>Sucesso!</h2>"
      "<p>Dispositivo provisionado e pronto para enviar telemetria.</p>"
      "<p>Reiniciando em 2s...</p>"
      "<p><a href='/'>Voltar</a></p>"
    );
    res->addHeader("Set-Cookie", "rt_sess=; Max-Age=0; Path=/");
    req->send(res);

    logf("[PROVISION] OK -> reboot.");
    delay(2000);
    ESP.restart();
  });

  // Factory reset (permitido mesmo provisionado, mas protegido)
  server.on("/factory-reset", HTTP_GET, [](AsyncWebServerRequest* req) {
    requireSensitiveSessionOrPinPage(req, "/factory-reset");
    if (!sessionValid(req)) return;
    req->send(200, "text/html; charset=utf-8", renderFactoryResetPage());
  });

  server.on("/factory-reset", HTTP_POST, [](AsyncWebServerRequest* req) {
    requireSensitiveSessionOrPinPage(req, "/factory-reset");
    if (!sessionValid(req)) return;

    String confirm = req->hasParam("confirm", true) ? req->getParam("confirm", true)->value() : "";
    confirm.trim();

    if (confirm != "RESET") {
      req->send(200, "text/html; charset=utf-8", renderFactoryResetPage("Confirmação inválida. Digite RESET."));
      return;
    }

    req->send(200, "text/html; charset=utf-8", "<h2>Resetando...</h2><p>Apagando NVS e reiniciando.</p>");
    delay(600);
    nvsFactoryReset();
    delay(300);
    ESP.restart();
  });

  // Proxy API: /api/login (JSON)
  auto* loginHandler = new AsyncCallbackJsonWebHandler("/api/login",
    [](AsyncWebServerRequest* request, JsonVariant& json) {
      JsonObject body = json.as<JsonObject>();
      String email = jsonStringOrEmpty(body["email"]);
      String password = jsonStringOrEmpty(body["password"]);

      email.trim();
      password.trim();

      if (!email.length() || !password.length()) {
        request->send(400, "application/json", "{\"message\":\"Informe email e senha\"}");
        return;
      }

      String userId, access, refresh, err;
      if (!backendLogin(email, password, userId, access, refresh, err)) {
        JsonDocument resp;
        resp["message"] = err;
        String out; serializeJson(resp, out);
        request->send(401, "application/json", out);
        return;
      }

      nvsSaveLogin(userId, access, refresh);

      JsonDocument resp;
      resp["userId"] = userId;
      resp["email"] = email;

      String out;
      serializeJson(resp, out);
      request->send(200, "application/json", out);
    }
  );
  server.addHandler(loginHandler);

  // Proxy API: /api/patios (GET)
  server.on("/api/patios", HTTP_GET, [](AsyncWebServerRequest* req) {
    String json, err;
    if (!backendGetPatios(json, err)) {
      JsonDocument resp;
      resp["message"] = err;
      String out; serializeJson(resp, out);
      req->send(503, "application/json", out);
      return;
    }
    req->send(200, "application/json", json);
  });

  server.onNotFound([](AsyncWebServerRequest* req) {
    req->send(404, "text/plain; charset=utf-8", "Rota não encontrada.");
  });
}