#ifndef PAGES_H
#define PAGES_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>

const char LOGIN_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login ESP32</title>
    <style>
        body {
            background: #0f172a;
            color: #e5e7eb;
            font-family: Arial;
        }

        input,
        button {
            width: 100%;
            padding: 8px;
            margin: 6px 0;
            border-radius: 10px;
            box-sizing: border-box;
        }

        button {
            background-color: #1e403c;
            max-width: 20%;
            color: white;
            border: 2px solid #29514c;
            cursor: pointer;
        }

        .container {
            background-color: #293041;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            max-width: 500px;
            margin: auto;
            padding: 2%;
        }

        h3 {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Login</h2>
        <form action="/login" method="POST">
            <label>Email:</label><br>
            <input type="email" name="email" required><br><br>

            <label>Senha:</label><br>
            <input type="password" name="password" required><br><br>

            <button type="submit"><b>Entrar</b></button>
        </form>
    </div>
</body>
</html>
)rawliteral";

const char LOGIN_ERROR_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login ESP32</title>
    <style>
        body {
            background: #0f172a;
            color: #e5e7eb;
            font-family: Arial;
        }

        button {
            background-color: #1e403c;
            max-width: 100px;
            width: 100%;
            padding: 8px;
            margin: 6px 0;
            border-radius: 10px;
            box-sizing: border-box;
            color: white;
            border: 2px solid #29514c;
            cursor: pointer;
        }

        .container {
            background-color: #412929;
            border-radius: 10px;
            border: 1px solid #954a4a;
            max-width: 200px;
            margin: auto;
            padding: 2%;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Falha no login</h2>
        <p>Email ou senha inválidos!</p>
        <a href="/"><button>Voltar</button></a>
    </div>
</body>
</html>
)rawliteral";

const char PROVISION_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Provisionamento</title>
    <style>
        body {
            background: #0f172a;
            color: #e5e7eb;
            font-family: Arial;
        }

        input,
        select,
        textarea,
        button {
            width: 100%;
            padding: 8px;
            margin: 6px 0;
            border-radius: 10px;
            box-sizing: border-box;
        }

        button {
            background-color: #1e403c;
            max-width: 20%;
            color: white;
            border: 2px solid #29514c;
            cursor: pointer;
        }

        .container {
            background-color: #293041;
            border-radius: 5%;
            border: 1px solid #e5e7eb;
            max-width: 900px;
            margin: auto;
            padding: 2%;
        }

        h3 {
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">

        <h1>Provisionamento do Equipamento</h1>

        <h3>1) Operador</h3>
        <label>User ID</label>
        <input type="text" id="userId" readonly>

        <h3>2) Pátio</h3>
        <select id="patioSelect"></select>

        <h3>3) Identificação da máquina</h3>
        <input id="machineKey" placeholder="Machine Key">
        <input id="manufacturer" placeholder="Fabricante">
        <input id="model" placeholder="Modelo">
        <select id="status">
            <option>operante</option>
            <option>manutenção</option>
        </select>

        <h3>4) Meta (opcional)</h3>
        <input id="tag" placeholder="Tag">
        <input id="power" placeholder="Potência (kW)">
        <input id="voltage" placeholder="Tensão nominal (V)">
        <textarea id="notes" placeholder="Observações"></textarea>

        <button onclick="provision()"><b>Provisionar</b></button>

    </div>

    <script>
        async function loadUser() {
            const r = await fetch('/api/user');
            const d = await r.json();
            document.getElementById('userId').value = d.userId;
        }

        async function loadPatios() {
            const r = await fetch('/api/patios');
            const patios = await r.json();
            const sel = document.getElementById('patioSelect');
            patios.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.patioId;
                opt.text = p.name;
                sel.appendChild(opt);
            });
        }

        async function provision() {
            const payload = {
                patioId: document.getElementById('patioSelect').value,
                machineKey: document.getElementById('machineKey').value,
                manufacturer: document.getElementById('manufacturer').value,
                model: document.getElementById('model').value,
                status: document.getElementById('status').value,
                tag: document.getElementById('tag').value,
                power: document.getElementById('power').value,
                voltage: document.getElementById('voltage').value,
                notes: document.getElementById('notes').value
            };

            try {
                const response = await fetch('/provision', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Se o status for 200-299
                if (response.ok) {
                    alert("Provisionado com sucesso!");
                    window.location.href = "/status"; // Redireciona manualmente
                } 
                else {
                    // Se houver erro, lê o texto enviado pelo ESP32 (ex: "Já existe uma máquina...")
                    const errorMsg = await response.text();
                    alert("Erro: " + errorMsg);
                }
            } catch (error) {
                alert("Erro de conexão com o ESP32");
            }
        }

        loadUser();
        loadPatios();
    </script>
</body>

</html>
)rawliteral";

const char STATUS_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Status do Dispositivo</title></head>
<style>
  body {
      background: #0f172a;
      color: #e5e7eb;
      font-family: Arial;
  }

  input,
  button {
      width: 100%;
      padding: 8px;
      margin: 6px 0;
      border-radius: 10px;
      box-sizing: border-box;
  }

  button {
      background-color: #401e1e;
      max-width: 200px;
      color: white;
      border: 2px solid #512929;
      cursor: pointer;
  }

  .container {
      background-color: #293041;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      max-width: 500px;
      margin: auto;
      padding: 2%;
  }

  h3 {
      margin-top: 20px;
  }

  .container-buttons {
      display: flex;
      justify-content: space-between;
      gap: 5%;
      justify-content: center;
  }

  .site{
      background-color: #1e403c;
      max-width: 200px;
      color: white;
      border: 2px solid #29514c;
      cursor: pointer;
  }

  a {
      color: white;
      text-decoration: none;
      font-size: small;
  }
</style>
<body>
<div class="container">

    <h2>Provisionamento Ativo</h2>

    <p><b>Machine ID:</b> %MACHINE_ID%</p>
    <p><b>Modelo:</b> %MODEL%</p>
    <p><b>Fabricante:</b> %MANUFACTURER%</p>

    <div class="container-buttons">
        <form action="/reset" method="POST">
            <button type="submit" style="color:white;"><b>Resetar Provisionamento</b></button>
        </form>
        <button class="site"><a href="https://rotorial.vercel.app/login" target="_blank"><b>Visualizar</b></a></button>
    </div>

</div>
</body>
</html>
)rawliteral";

#endif