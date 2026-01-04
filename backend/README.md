<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=E66C07&height=120&section=header"/>

# Rotorial Backend — API (NestJS + Prisma + Supabase)

Este diretório contém o backend do Rotorial: uma API responsável por autenticação, gestão de máquinas e pátios, ingestão de telemetria, avaliação de thresholds, geração de alarmes e integração com N8N (para automação e sugestão de thresholds baseados em IA).

---

## 🧩 Stack / Tecnologias

- Linguagem: TypeScript
- Framework: NestJS
- ORM: Prisma
- Banco de Dados: PostgreSQL (via Supabase)
- Autenticação: JWT (Access Token + Refresh Token com rotação)
- Containerização e Deploy: Docker + Render.com
- Integração de IA: N8N (via webhook externo)

---

## ✅ Funcionalidades Principais

### 🔐 Autenticação
- Login e logout de usuários internos
- Rotação de tokens de atualização (refresh token)
- Perfil autenticado (`/auth/me`)
- Registro de novos usuários restrito a administradores

### 🏭 Domínio de Negócio
- Máquinas: cadastro, consulta, atualização e metadados
- Pátios: agrupamento e organização de máquinas
- Telemetria: ingestão e consulta de dados com filtros temporais
- Alarmes: abertura, confirmação e fechamento, com filtros por severidade e status
- Thresholds: criação manual e via N8N (IA), com versionamento por máquina
- Emissões: cálculo de fatores ambientais (ex.: kgCO₂/kWh por máquina)

---

## 📦 Execução com Docker

> O projeto possui `Dockerfile` configurado. Para execução local, é necessário apenas o arquivo `.env`.

### 1) Configuração do `.env`

Exemplo de conteúdo do arquivo `.env`:

```bash
# Banco (Supabase)
DATABASE_URL="postgresql://postgres:<SUA_SENHA>@db.iboklssetogmioikemlg.supabase.co:5432/postgres?sslmode=require"

# Supabase
SUPABASE_URL="https://iboklssetogmioikemlg.supabase.co"
SUPABASE_KEY="<SUA_SUPABASE_KEY>"

# JWT
JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET"
JWT_EXPIRES_IN_SECONDS=900

# Seed / Provisionamento
SEED_DEFAULT_ADMIN=true
PROVISIONING_TOKEN="santoDeus@1"

# Integração N8N
N8N_TIMEOUT_MS=60000
N8N_VALIDATE_DEVICE_URL="https://n8n.h-check.com.br:25678/webhook/validate-device"
```

### 2) Build da imagem

```bash
docker build -t rotorial-backend .
```

### 3) Execução do container

```bash
docker run --rm -p 3000:3000 --env-file .env rotorial-backend
```

A API estará disponível em:

- `http://localhost:3000`

---

## 🧪 Execução sem Docker (opcional)

```bash
npm ci
npx prisma generate
npm run build
npm run start:prod
```

Para desenvolvimento:

```bash
npm run start:dev
```

---

## 🗃️ Banco de Dados / Prisma (Supabase)

- O `DATABASE_URL` deve incluir `?sslmode=require` para compatibilidade com o Supabase.
- Em produção, todas as variáveis do `.env` devem ser configuradas no painel do Render.
- Migrations:
  - Produção: `prisma migrate deploy`
  - Desenvolvimento: `prisma migrate dev`

---

## 🔑 Autenticação

### Tokens
- Access Token (JWT): enviado em `Authorization: Bearer <token>`
- Refresh Token: armazenado e rotacionado a cada renovação

### Respostas de Erro
- `401` – Token inválido ou não autenticado
- `403` – Usuário desabilitado

---

## 📡 Endpoints Principais (resumo)

> Abaixo está um guia rápido. O frontend/firmware devem usar os endpoints definidos no projeto.

### Auth

**POST `/auth/login`**
Request:

```json
{ "email": "rotorial@admin.com", "password": "admin" }
```

Response:

```json
{
  "accessToken": "jwt...",
  "refreshToken": "uuid...",
  "user": { "id": "uuid", "email": "rotorial@admin.com", "fullName": "Admin", "role": "admin", "status": "active" }
}
```

**POST `/auth/refresh`**
Request:

```json
{ "refreshToken": "uuid..." }
```

Response: mesma forma do login, com tokens novos.

**POST `/auth/logout`**
Request:

```json
{ "refreshToken": "uuid..." }
```

Response: `204 No Content`

**GET `/auth/me`**
Response:

```json
{ "id": "uuid", "email": "rotorial@admin.com", "fullName": "Admin", "role": "admin", "status": "active" }
```

**POST `/auth/register`** (somente admin / interno)
Request:

```json
{ "email": "user@rotorial.com", "password": "SenhaForte123", "fullName": "Usuário", "role": "operator" }
```

---

## 🤖 Integração com Firmware (ESP32)

A API fornece endpoints para:
- Validação e provisionamento de dispositivos
- Associação de dispositivos a máquinas
- Envio de dados de telemetria

### Token de Provisionamento
As chamadas do firmware utilizam um token de autenticação (hackathon):

- Header sugerido: `x-token: santoDeus@1`

O valor deve ser definido via variável `PROVISIONING_TOKEN` e validado no backend.

---

## 📊 Métricas de Dashboard (exemplo)

**GET `/dashboard/metrics?from=<ISO>&to=<ISO>`**
Exemplo:

```bash
curl -X GET   "http://localhost:3000/dashboard/metrics?from=2023-01-01T00:00:00.000Z&to=2023-01-31T23:59:59.999Z"   -H "accept: application/json"
```

Exemplo de resposta:

```json
{
  "cards": {
    "machinesTotal": 12,
    "patiosTotal": 4,
    "alarms": {
      "byStatus": { "open": 3, "ack": 2, "closed": 10 },
      "bySeverity": { "info": 5, "warn": 7, "crit": 3 },
      "openBySeverity": { "info": 0, "warn": 2, "crit": 1 }
    }
  },
  "averages": {
    "avgVoltageV": 221.7,
    "avgCurrentA": 12.4,
    "avgTemperatureC": 49.2
  },
  "meta": {
    "tag": "MTR-001",
    "powerKw": 15,
    "voltageNominal": 220,
    "notes": "Motor da linha 3"
  }
}
```

---

## 🚀 Deploy no Render.com (Docker)

1. Criar um serviço Web Service no Render
2. Selecionar o repositório do backend
3. Escolher Docker como runtime
4. Configurar as variáveis do `.env` no painel do Render
5. Executar o deploy

> Recomenda-se manter o `JWT_SECRET` constante entre deploys para preservar a validade dos tokens existentes.

---

## 🧯 Troubleshooting

| Problema | Causa provável | Solução |
|---|---|---|
| `DATABASE_URL` inválida | Falta de `sslmode=require` | Ajustar URL |
| Erro de conexão no Supabase | Variáveis incorretas | Verificar `.env` |
| `401` no frontend | Token ausente/inválido | Validar `Authorization: Bearer` |
| Falha no refresh | Token expirado/inválido | Realizar novo login |

---

<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=E66C07&height=120&section=footer"/>
