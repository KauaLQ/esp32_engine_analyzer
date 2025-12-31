#include "pages.h"

void sendSetupBlocked(AsyncWebServerRequest* req) {
  req->send(403, "text/html; charset=utf-8",
    "<h2>Setup bloqueado</h2>"
    "<p>Este dispositivo já foi provisionado.</p>"
    "<p>Se precisar reconfigurar, use <b>Factory Reset</b>.</p>"
    "<p><a href='/'>Voltar</a></p>");
}

// 1) Protege área de SETUP: bloqueia se provisionado + exige sessão/PIN
void requireSetupSessionOrPinPage(AsyncWebServerRequest* req, const String& nextPath) {
  if (g_provisioned) { sendSetupBlocked(req); return; }
  if (sessionValid(req)) return;

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>PIN de Setup</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:18px}"
          ".card{max-width:520px;margin:0 auto;background:rgba(255,255,255,.04);"
          "border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          "input,button{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);"
          "background:rgba(255,255,255,.06);color:#e6eefc}"
          "button{cursor:pointer;font-weight:800;margin-top:10px}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2>Área protegida</h2>";
  html += "<p>Digite o <b>PIN de Setup</b> exibido no display/Serial.</p>";
  if (!pinStillValid()) {
    html += "<p style='color:#ffbd2e'>O PIN expirou. Reinicie o ESP32 para gerar um novo.</p>";
  }
  html += "<form method='POST' action='/setup/auth'>";
  html += "<input name='pin' placeholder='PIN (6 dígitos)' inputmode='numeric' pattern='[0-9]{6}' required />";
  html += "<input type='hidden' name='next' value='" + htmlEscape(nextPath) + "'/>";
  html += "<button type='submit'>Entrar</button>";
  html += "</form>";
  html += "<p style='margin-top:10px'><a href='/'>Voltar</a></p>";
  html += "</div></body></html>";

  req->send(401, "text/html; charset=utf-8", html);
}

// 2) Protege ações sensíveis (ex.: factory reset) mesmo provisionado: exige sessão/PIN
void requireSensitiveSessionOrPinPage(AsyncWebServerRequest* req, const String& nextPath) {
  if (sessionValid(req)) return;

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>PIN de Segurança</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:18px}"
          ".card{max-width:520px;margin:0 auto;background:rgba(255,255,255,.04);"
          "border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          "input,button{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);"
          "background:rgba(255,255,255,.06);color:#e6eefc}"
          "button{cursor:pointer;font-weight:800;margin-top:10px}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2>Confirme o PIN</h2>";
  html += "<p>Digite o <b>PIN de Setup</b> exibido no display/Serial.</p>";
  if (!pinStillValid()) {
    html += "<p style='color:#ffbd2e'>O PIN expirou. Reinicie o ESP32 para gerar um novo.</p>";
  }
  html += "<form method='POST' action='/setup/auth'>";
  html += "<input name='pin' placeholder='PIN (6 dígitos)' inputmode='numeric' pattern='[0-9]{6}' required />";
  html += "<input type='hidden' name='next' value='" + htmlEscape(nextPath) + "'/>";
  html += "<button type='submit'>Entrar</button>";
  html += "</form>";
  html += "<p style='margin-top:10px'><a href='/'>Voltar</a></p>";
  html += "</div></body></html>";

  req->send(401, "text/html; charset=utf-8", html);
}

// Web UI
String renderHomePage() {
  bool staConnected = (WiFi.status() == WL_CONNECTED);
  String mode = (WiFi.getMode() == WIFI_AP || WiFi.getMode() == WIFI_AP_STA) ? (staConnected ? "AP+STA" : "AP") : "STA";

  String ip = staConnected ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  String ssidShown = staConnected ? WiFi.SSID() : (g_apRunning ? g_apSsid : "");
  int rssi = staConnected ? WiFi.RSSI() : 0;

  uint32_t up = millis() / 1000;
  uint32_t heap = ESP.getFreeHeap();

  measurement_t m;
  xSemaphoreTake(g_dataMutex, portMAX_DELAY);
  m = g_latest;
  xSemaphoreGive(g_dataMutex);

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Rotorial • ESP32</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0}"
          "header{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08)}"
          "main{padding:16px;max-width:980px;margin:0 auto;display:grid;gap:12px}"
          ".grid{display:grid;grid-template-columns:1fr;gap:12px}"
          "@media(min-width:900px){.grid{grid-template-columns:1fr 1fr}}"
          ".card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:14px}"
          ".kv{display:grid;grid-template-columns:140px 1fr;gap:6px 10px;font-size:13px}"
          ".btn{display:inline-block;text-decoration:none;color:#e6eefc;border:1px solid rgba(255,255,255,.14);"
          "background:rgba(255,255,255,.06);padding:10px 12px;border-radius:12px;font-weight:800}"
          ".btn:hover{background:rgba(255,255,255,.10)}"
          ".row{display:flex;gap:10px;flex-wrap:wrap}"
          ".pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);"
          "background:rgba(0,0,0,.25);font-size:12px}"
          "</style></head><body>";

  html += "<header><b>Rotorial • ESP32</b><div style='opacity:.75;font-size:12px'>Provisionamento e telemetria</div></header>";
  html += "<main><div class='grid'>";

  html += "<section class='card'><h3 style='margin:0 0 10px 0'>Situação do dispositivo</h3>";
  html += "<div class='kv'>";
  html += "<div>deviceId</div><div>" + htmlEscape(g_deviceId) + "</div>";
  html += "<div>fwVersion</div><div>" + String(FW_VERSION) + "</div>";
  html += "<div>Provisionado?</div><div>" + String(g_provisioned ? "Sim" : "Não") + "</div>";
  html += "<div>machineId</div><div>" + htmlEscape(g_machineId.length() ? g_machineId : "(vazio)") + "</div>";
  html += "<div>Operador (userId)</div><div>" + htmlEscape(g_operatorUserId.length() ? g_operatorUserId : "(não logado)") + "</div>";
  html += "<div>Wi-Fi modo</div><div>" + mode + "</div>";
  html += "<div>IP</div><div>" + ip + "</div>";
  html += "<div>SSID</div><div>" + htmlEscape(ssidShown) + "</div>";
  html += "<div>RSSI</div><div>" + String(rssi) + "</div>";
  html += "<div>Uptime</div><div>" + String(up) + "s</div>";
  html += "<div>Heap livre</div><div>" + String(heap) + "</div>";
  html += "<div>Última telemetria</div><div>" + htmlEscape(g_lastTelemetryAtIso.length() ? g_lastTelemetryAtIso : "(ainda não)") + "</div>";
  html += "<div>HTTP telemetria</div><div>" + String(g_lastTelemetryHttp) + "</div>";
  html += "</div>";

  html += "<div class='row' style='margin-top:12px'>";
  html += "<a class='btn' href='/setup'>Configurar / Provisionar</a>";
  html += "<a class='btn' href='/status'>Status (JSON)</a>";
  html += "<a class='btn' href='/logs'>Logs</a>";
  html += "<a class='btn' href='/factory-reset'>Factory reset</a>";
  html += "</div>";

  html += "<p style='opacity:.75;font-size:12px;margin-top:10px'>Backend fixo: " + String(BACKEND_BASE_URL) + "</p>";
  html += "</section>";

  html += "<section class='card'><h3 style='margin:0 0 10px 0'>Leituras (reais)</h3>";
  html += "<div class='pill'>Tensão: <b>" + String(m.voltageV, 1) + " V</b></div> ";
  html += "<div class='pill'>Corrente: <b>" + String(m.currentA, 3) + " A</b></div> ";
  html += "<div class='pill'>Temperatura: <b>" + String(m.temperatureC, 2) + " °C</b></div>";
  html += "<p style='opacity:.7;font-size:12px;margin-top:10px'>Esses valores são os mesmos usados no envio de telemetria.</p>";
  html += "</section>";

  html += "</div>";

  // Login prompt (somente se NÃO provisionado; melhora UX do setup)
  html += "<script>"
          "async function doLoginPrompt(){"
          "  if(localStorage.getItem('rt_userId')) return;"
          "  const email=prompt('Rotorial - Login\\n\\nDigite seu e-mail:');"
          "  if(!email) return;"
          "  const password=prompt('Digite sua senha:');"
          "  if(!password) return;"
          "  try{"
          "    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});"
          "    const j=await r.json();"
          "    if(!r.ok){alert(j.message||'Falha no login');return;}"
          "    localStorage.setItem('rt_userId', j.userId);"
          "    localStorage.setItem('rt_email', j.email||email);"
          "    alert('Login OK! Operador vinculado: '+j.userId);"
          "  }catch(e){alert('Erro de rede no login. Configure o Wi-Fi no setup.');}"
          "}"
          "const provisioned=" + String(g_provisioned ? "true" : "false") + ";"
          "if(!provisioned){ doLoginPrompt(); }"
          "</script>";

  html += "</main></body></html>";
  return html;
}

String renderSetupFormPage(const String& msg) {
  prefs.begin(NVS_NS, true);
  String ssid = nvsGetStringSafe(prefs, "wifiSsid", "");
  String pass = nvsGetStringSafe(prefs, "wifiPass", "");
  String machineKey = nvsGetStringSafe(prefs, "machineKey", "");
  String patioId = nvsGetStringSafe(prefs, "patioId", "");
  String manufacturer = nvsGetStringSafe(prefs, "manufacturer", "");
  String model = nvsGetStringSafe(prefs, "model", "");
  String status = nvsGetStringSafe(prefs, "status", "operante");
  String metaTag = nvsGetStringSafe(prefs, "metaTag", "");
  String metaPowerKw = nvsGetStringSafe(prefs, "metaPowerKw", "");
  String metaVoltNom = nvsGetStringSafe(prefs, "metaVoltNom", "");
  String metaNotes = nvsGetStringSafe(prefs, "metaNotes", "");
  prefs.end();

  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Setup • Rotorial</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:16px}"
          ".card{max-width:980px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          ".grid{display:grid;grid-template-columns:1fr;gap:12px}"
          "@media(min-width:900px){.grid{grid-template-columns:1fr 1fr}}"
          "label{font-size:12px;opacity:.8}"
          "input,select,textarea{width:100%;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e6eefc}"
          "textarea{min-height:80px}"
          ".btn{cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e6eefc;border-radius:12px;padding:10px 12px;font-weight:900}"
          ".btn.primary{background:rgba(43,213,118,.16);border-color:rgba(43,213,118,.35)}"
          ".btn.warn{background:rgba(255,189,46,.14);border-color:rgba(255,189,46,.35)}"
          ".row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}"
          ".msg{padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.25);margin-bottom:12px}"
          "a{color:#9bd}"
          "</style></head><body>";

  html += "<div class='card'>";
  html += "<h2 style='margin:0 0 6px 0'>Configuração / Provisionamento</h2>";
  html += "<p style='opacity:.75;margin:0 0 12px 0'>deviceId: <b>" + htmlEscape(g_deviceId) + "</b> • fwVersion: <b>" + String(FW_VERSION) + "</b></p>";

  if (msg.length()) html += "<div class='msg'>" + htmlEscape(msg) + "</div>";

  html += "<div class='msg' id='loginBox' style='display:none'></div>";

  html += "<form method='POST' action='/setup/save'>";
  html += "<div class='grid'>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>1) Wi-Fi (para ter internet)</h3>";
  html += "<label>SSID</label><input name='ssid' value='" + htmlEscape(ssid) + "' required />";
  html += "<label>Senha</label><input name='pass' type='password' value='" + htmlEscape(pass) + "' />";
  html += "<p style='opacity:.7;font-size:12px'>Após salvar, o ESP tenta conectar em paralelo (AP + STA).</p>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>2) Operador e Pátio</h3>";
  html += "<label>Operador (userId)</label>"
          "<input id='operatorUserId' name='operatorUserId' value='" + htmlEscape(g_operatorUserId) + "' readonly />";

  html += "<label>Pátio</label>"
          "<select id='patioId' name='patioId' required>"
          "<option value=''>Carregando pátios...</option>"
          "</select>";

  html += "<p style='opacity:.7;font-size:12px'>O operador é obtido via login; o pátio vem do endpoint público.</p>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>3) Identificação da máquina</h3>";
  html += "<label>machineKey</label><input name='machineKey' value='" + htmlEscape(machineKey) + "' placeholder='MTR-001' required />";
  html += "<label>Fabricante</label><input name='manufacturer' value='" + htmlEscape(manufacturer) + "' placeholder='WEG' required />";
  html += "<label>Modelo</label><input name='model' value='" + htmlEscape(model) + "' placeholder='W22' required />";
  html += "<label>Status</label>"
          "<select name='status'>"
          "<option value='operante'" + String(status=="operante" ? " selected" : "") + ">Operante</option>"
          "<option value='inoperante'" + String(status=="inoperante" ? " selected" : "") + ">Inoperante</option>"
          "<option value='manutencao'" + String(status=="manutencao" ? " selected" : "") + ">Em manutenção</option>"
          "</select>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>4) Meta (opcional)</h3>";
  html += "<label>Tag</label><input name='metaTag' value='" + htmlEscape(metaTag) + "' placeholder='MTR-001' />";
  html += "<label>Potência (kW)</label><input name='metaPowerKw' value='" + htmlEscape(metaPowerKw) + "' placeholder='15' />";
  html += "<label>Tensão nominal (V)</label><input name='metaVoltNom' value='" + htmlEscape(metaVoltNom) + "' placeholder='220' />";
  html += "<label>Observações</label><textarea name='metaNotes' placeholder='Motor da linha 3'>" + htmlEscape(metaNotes) + "</textarea>";
  html += "</div>";

  html += "<div>";
  html += "<h3 style='margin:0 0 10px 0'>Ações</h3>";
  html += "<div class='row'>";
  html += "<button class='btn warn' type='submit'>Salvar configuração</button>";
  html += "</form>";

  html += "<form method='POST' action='/setup/provision' style='margin:0'>";
  html += "<button class='btn primary' type='submit'>Provisionar no backend</button>";
  html += "</form>";

  html += "<a class='btn' href='/' style='text-decoration:none;display:inline-block'>Voltar</a>";
  html += "<button class='btn' type='button' onclick='trocarOperador()'>Trocar operador</button>";
  html += "</div>";
  html += "<p style='opacity:.7;font-size:12px;margin-top:10px'>Após provisionar, o setup será bloqueado.</p>";
  html += "</div>";

  html += "</div>"; // grid
  html += "</div>"; // card

  // JS: login + carregar patios
  html += "<script>"
          "const draftPatio='" + htmlEscape(patioId) + "';"
          "function showMsg(t){ const box=document.getElementById('loginBox'); box.style.display='block'; box.textContent=t; }"
          "async function loginSePreciso(){"
          "  if(localStorage.getItem('rt_userId')){"
          "    document.getElementById('operatorUserId').value=localStorage.getItem('rt_userId');"
          "    return;"
          "  }"
          "  const email=prompt('Rotorial - Login do Operador\\n\\nDigite seu e-mail:');"
          "  if(!email){ showMsg('Sem login: você ainda pode preencher Wi-Fi e salvar.'); return; }"
          "  const password=prompt('Digite sua senha:');"
          "  if(!password){ showMsg('Login cancelado.'); return; }"
          "  try{"
          "    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});"
          "    const j=await r.json();"
          "    if(!r.ok){ showMsg(j.message||'Falha no login'); return; }"
          "    localStorage.setItem('rt_userId', j.userId);"
          "    localStorage.setItem('rt_email', j.email||email);"
          "    document.getElementById('operatorUserId').value=j.userId;"
          "    showMsg('Login OK! Operador vinculado: ' + j.userId);"
          "  }catch(e){ showMsg('Erro de rede no login. Configure o Wi-Fi e salve.'); }"
          "}"
          "async function carregarPatios(){"
          "  try{"
          "    const r=await fetch('/api/patios',{cache:'no-store'});"
          "    const j=await r.json();"
          "    const sel=document.getElementById('patioId');"
          "    sel.innerHTML='';"
          "    if(!Array.isArray(j)){ sel.innerHTML='<option value=\"\">Falha ao carregar</option>'; return; }"
          "    sel.insertAdjacentHTML('beforeend','<option value=\"\">Selecione um pátio</option>');"
          "    for(const p of j){"
          "      const id=p.patioId||p.id||'';"
          "      const name=p.name||'Pátio';"
          "      const addr=p.address||'';"
          "      const opt=document.createElement('option');"
          "      opt.value=id;"
          "      opt.textContent= name + (addr?(' — '+addr):'');"
          "      if(draftPatio && id===draftPatio) opt.selected=true;"
          "      sel.appendChild(opt);"
          "    }"
          "  }catch(e){"
          "    const sel=document.getElementById('patioId');"
          "    sel.innerHTML='<option value=\"\">Sem internet para carregar pátios</option>';"
          "  }"
          "}"
          "async function trocarOperador(){"
          "  localStorage.removeItem('rt_userId');"
          "  localStorage.removeItem('rt_email');"
          "  await loginSePreciso();"
          "}"
          "loginSePreciso().then(carregarPatios);"
          "</script>";

  html += "</body></html>";
  return html;
}

String renderLogsPage() {
  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Logs</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:16px}"
          ".card{max-width:980px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          ".btn{display:inline-block;text-decoration:none;color:#e6eefc;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);padding:10px 12px;border-radius:12px;font-weight:900;margin-right:8px}"
          "pre{margin-top:12px;font-size:12px;white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2 style='margin:0 0 10px 0'>Logs</h2>";
  html += "<a class='btn' href='/'>Voltar</a>";
  html += "<a class='btn' href='/logs/download'>Baixar</a>";
  html += "<pre>" + htmlEscape(getLogsText()) + "</pre>";
  html += "</div></body></html>";
  return html;
}

String renderFactoryResetPage(const String& msg) {
  String html;
  html += "<!doctype html><html><head><meta charset='utf-8'/>"
          "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
          "<title>Factory Reset</title>"
          "<style>"
          "body{font-family:system-ui;background:#0b1220;color:#e6eefc;margin:0;padding:16px}"
          ".card{max-width:520px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}"
          "input,button{width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e6eefc}"
          "button{cursor:pointer;font-weight:900;margin-top:10px;background:rgba(255,80,80,.18);border-color:rgba(255,80,80,.35)}"
          ".msg{margin-bottom:10px;opacity:.9}"
          "a{color:#9bd}"
          "</style></head><body>";
  html += "<div class='card'>";
  html += "<h2 style='margin:0 0 10px 0'>Factory Reset</h2>";
  if (msg.length()) html += "<div class='msg'>" + htmlEscape(msg) + "</div>";
  html += "<p style='opacity:.8'>Isso apaga a configuração do dispositivo e reinicia.</p>";
  html += "<form method='POST' action='/factory-reset'>";
  html += "<input name='confirm' placeholder=\"Digite RESET para confirmar\" required />";
  html += "<button type='submit'>APAGAR E REINICIAR</button>";
  html += "</form>";
  html += "<p style='margin-top:10px'><a href='/'>Voltar</a></p>";
  html += "</div></body></html>";
  return html;
}