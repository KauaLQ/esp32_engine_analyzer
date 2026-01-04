<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=E66C07&height=120&section=header"/>

# Rotorial Frontend — Dashboard (React + Vite)

Este diretório contém o **frontend** do Rotorial: uma aplicação web (dashboard) para monitoramento de motores e dispositivos industriais. A aplicação é desacoplada do backend e se comunica via **API REST**.

---

## ✅ Principais Funcionalidades

- Listagem de dispositivos/motores
- Busca e filtros por nome e/ou localização
- Página de detalhes por dispositivo
- Monitoramento (quase) em tempo real de medições
- Gráficos interativos para visualização de dados
- Alertas para medições fora do esperado
- Alternância de tema (dark/light)

---

## 🧩 Stack / Tecnologias

- **React + Vite**: toolchain moderna e rápida
- **TypeScript**: tipagem estática
- **Mantine UI**: biblioteca de componentes e design system
- **Recharts**: gráficos e visualização
- **React Router**: roteamento de páginas
- **Axios**: consumo da API

---

## 🗂️ Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis de UI
│   ├── DeviceCard.tsx
│   ├── MeasurementsChart.tsx
│   └── MeasurementsTable.tsx
├── layout/             # Componentes de layout
│   └── MainLayout.tsx
├── routes/             # Páginas/rotas
│   ├── DeviceListPage.tsx
│   └── DeviceDetailsPage.tsx
├── services/           # Serviços de API
│   └── api.ts
├── App.tsx             # Componente raiz
└── main.tsx            # Entry point
```

---

## ▶️ Como rodar (sem Docker)

### Pré-requisitos

- Node.js **v16+**
- npm ou yarn

### Instalação e execução

1) Instalar dependências:

```bash
npm install
```

2) Criar arquivo `.env` na raiz do projeto:

```bash
VITE_API_BASE_URL=http://seu-backend-api-url
```

> Observação: se `VITE_API_BASE_URL` não for definido, a aplicação irá o usar o nosso backend atual: https://rotorial-backend.onrender.com

3) Iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

- `http://localhost:5173`

---

## 🏗️ Build para produção

Para gerar o build de produção:

```bash
npm run build
```

Os artefatos serão gerados em `dist/`.

Opcional (preview local do build):

```bash
npm run preview
```

---

## ⚙️ Configurações

### Base URL da API

A URL base é configurada via variável de ambiente:

```bash
VITE_API_BASE_URL=http://seu-backend-api-url
```

### Thresholds de alertas (exemplo)

Os limiares de alerta podem ser ajustados no código da página de detalhes (exemplo):

```ts
const TEMPERATURE_THRESHOLD = 60; // °C
const CURRENT_THRESHOLD = 12; // A
```

### Tema (Mantine)

O tema pode ser customizado no arquivo raiz da aplicação (exemplo):

```ts
const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // Customize cores aqui
  },
});
```

---

## 🧪 Mock Data

O projeto inclui dados simulados (**mock data**) para desenvolvimento e testes. Caso a API não esteja acessível, a aplicação pode alternar automaticamente para mock data (conforme implementação do projeto).

---

## 🧯 Troubleshooting

- **Tela sem dados / falha ao carregar**
  - Verificar `VITE_API_BASE_URL` e se o backend está acessível.
- **CORS / bloqueio no navegador**
  - Verificar configuração de CORS no backend e a URL utilizada no frontend.
- **Erros ao instalar dependências**
  - Confirmar Node.js v16+ e remover `node_modules/` + reinstalar.

---

<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=E66C07&height=120&section=footer"/>
