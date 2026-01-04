<img width=100% src="https://capsule-render.vercel.app/api?type=waving&color=E66C07&height=120&section=header"/>

# Rotorial – Sistema Embarcado para Monitoramento e Análise Preditiva de Motores Elétricos <img width='50' heigth='50' src="img/LOGO.png" />

<p align="center">
    <img width='700' src="img/PROTOTIPO.jpg" alt="exemplo em vídeo">
</p>

> _Protótipo montado na protoboard para validação inicial_

Este repositório contém o código-fonte completo do **Rotorial**, um sistema embarcado de monitoramento contínuo e análise preditiva de motores elétricos, desenvolvido com foco em **Indústria 4.0**, **manutenção preditiva** e **eficiência energética**.

O projeto integra **hardware embarcado**, **firmware em ESP32**, **backend web** e **dashboard frontend**, permitindo a coleta de dados em tempo real, visualização remota e detecção automática de condições anômalas de operação.

## 🎯 Objetivo do Projeto

Desenvolver uma solução acessível e escalável para o monitoramento de motores elétricos industriais, capaz de:

* Coletar variáveis elétricas e térmicas em tempo real (tensão, corrente e temperatura);
* Processar e transmitir os dados via Wi-Fi;
* Exibir as informações em um dashboard web intuitivo;
* Detectar automaticamente desvios de operação por meio de thresholds manuais ou orientados por Inteligência Artificial;
* Auxiliar na **detecção precoce de falhas**, **redução de paradas não planejadas** e **otimização do consumo energético**.

## 🧱 Estrutura do Repositório (pastas principais)

```
.
├── firmware/   # Código embarcado (ESP32-S3)
├── backend/    # API, regras de negócio, telemetria e alarmes
├── frontend/   # Dashboard web para visualização e operação
└── README.md   # Documentação geral do projeto
```

Cada módulo possui responsabilidades bem definidas e pode ser executado de forma independente.

## Firmware (ESP32-S3)

O firmware é o núcleo do sistema embarcado e é responsável pela **aquisição de dados**, **processamento local**, **comunicação com o backend** e **interface web local para provisionamento**.

### 🛠️ Tecnologias e Dependências

O firmware foi desenvolvido utilizando o **Arduino Framework para ESP32**, com suporte a multitarefa via FreeRTOS.

Principais bibliotecas de terceiros utilizadas:

* **Wire** – Comunicação I²C
* **Adafruit_MCP3421** – Interface com conversores A/D externos (18 bits)
* **Adafruit_BME280** e **Adafruit_Sensor** – Leitura de temperatura
* **WiFi** – Conectividade Wi-Fi
* **HTTPClient** – Envio de telemetria via HTTP
* **ESPAsyncWebServer** – Servidor web embarcado assíncrono
* **AsyncTCP** – Suporte TCP assíncrono
* **ArduinoJson** – Serialização e desserialização de mensagens JSON
* **Preferences** – Armazenamento persistente em NVS (flash)

### ⚙️ Funcionalidades do Firmware

* Leitura de:

  * Corrente elétrica (ACS712 + MCP3421)
  * Tensão elétrica (transformador + retificador + MCP3421)
  * Temperatura (BME280)
* Cálculo de valores eficazes (RMS) para grandezas elétricas;
* Execução concorrente de tarefas usando FreeRTOS;
* Comunicação segura com backend via HTTP;
* Servidor web local para:

  * Login
  * Provisionamento do dispositivo
  * Associação com máquinas e pátios
* Armazenamento persistente de configurações e estado do dispositivo;
* Envio periódico de telemetria para análise e geração de alarmes.

### ▶️ Como Executar o Firmware

#### Pré-requisitos

* ESP32-S3
* Arduino IDE ou PlatformIO
* Driver USB do ESP32 instalado
* Hardware conectado (sensores e condicionamento de sinal)

#### Passos básicos

1. Abra o projeto localizado em `firmware/src/main.cpp`
2. Instale as bibliotecas listadas acima
3. Configure:

   * Credenciais Wi-Fi
   * URL do backend
4. Selecione a placa **ESP32-S3**
5. Compile e faça o upload do firmware
6. Acesse o IP do dispositivo via navegador para provisionamento

## 🌐 Backend

O backend é responsável por **autenticação**, **gerenciamento de máquinas**, **ingestão de telemetria**, **avaliação de thresholds** e **geração de alarmes**.

* Linguagem: **TypeScript**
* Framework: **NestJS**
* Banco de dados: **PostgreSQL (Supabase)**
* ORM: **Prisma**
* Autenticação: **JWT (access + refresh tokens)**
* Integração com IA: **N8N**

📄 Para detalhes completos de endpoints e configuração, consulte o README específico em:

```
backend/README.md
```

## 📊 Frontend

O frontend fornece um **dashboard web moderno** para visualização dos dados e operação do sistema.

* Linguagem: **TypeScript**
* Framework: **React + Vite**
* UI: **Mantine**
* Gráficos: **Recharts**
* Data fetching: **TanStack Query**
* HTTP: **Axios**

Funcionalidades principais:

* Visualização em tempo real das variáveis monitoradas;
* Histórico de medições;
* Alarmes e status das máquinas;
* Controle de usuários e permissões;
* Interface responsiva com modo claro/escuro.

📄 Mais detalhes no README localizado em:

```
frontend/README.md
```

## 🧠 Inteligência Artificial e Thresholds

O sistema de thresholds define limites aceitáveis de operação para cada máquina, permitindo a detecção automática de desvios.

* **Manual**: operador define limites de alerta e crítico;
* **Orientado por IA (N8N)**:

  * Busca automática de datasheets do motor;
  * Extração de informações via OCR;
  * Segmentação em trechos (chunks);
  * Cálculo de relevância para definição dos limites operacionais.

Esse mecanismo torna o sistema mais inteligente e adaptável a diferentes tipos de motores industriais.

## 🚀 Possibilidades de Evolução

* Inclusão de sensores de vibração e potência elétrica;
* Modelos de IA baseados em séries temporais;
* Armazenamento local para operação offline;
* Desenvolvimento de PCB dedicada;
* Integração com sistemas industriais (SCADA, MQTT, OPC-UA).
