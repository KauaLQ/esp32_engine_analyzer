# Machines Module

This module handles machine registration, device management, and integration with the Telemetry module.

## Environment Variables

Make sure to set the following environment variable in your `.env` file:

```
PROVISIONING_TOKEN=CHANGE_ME_TO_LONG_SECRET
```

## API Endpoints

### Provisioning Endpoint

This endpoint is used by devices to register themselves and associate with a machine.

```bash
curl -X POST http://localhost:3000/provision \
  -H "Content-Type: application/json" \
  -H "x-provision-token: CHANGE_ME_TO_LONG_SECRET" \
  -d '{
    "deviceId": "ROTORIAL-ESP32-A1B2C3",
    "machineKey": "MTR-001",
    "patioId": "b8b2c7d5-5c76-4f7d-9d03-7ac0c86c3c2f",
    "manufacturer": "WEG",
    "model": "W22",
    "status": "operante",
    "operatorUserId": "7b09b75a-e013-4d63-a9b6-2bcecd48b4ee",
    "meta": {
      "tag": "MTR-001",
      "powerKw": 15,
      "voltageNominal": 220,
      "notes": "Motor da linha 3"
    },
    "fwVersion": "1.0.0"
  }'
```

### Dashboard Endpoints

#### List Machines

```bash
curl -X GET http://localhost:3000/machines \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

With query parameters:

```bash
curl -X GET "http://localhost:3000/machines?search=MTR&status=operante&limit=10" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Get Machine Details

```bash
curl -X GET http://localhost:3000/machines/8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Update Machine

```bash
curl -X PATCH http://localhost:3000/machines/8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "status": "manutencao",
    "operatorUserId": "7b09b75a-e013-4d63-a9b6-2bcecd48b4ee",
    "meta": {
      "notes": "Em manutenção preventiva"
    }
  }'
```

### Telemetry Integration

After provisioning, the device should use the machineId returned in the response to send telemetry data:

```bash
curl -X POST http://localhost:3000/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e",
    "ts": "2025-12-26T11:40:10.000-03:00",
    "voltageV": 221.7,
    "currentA": 12.4,
    "temperatureC": 49.2,
    "seq": 120
  }'
```

## Implementation Details

- Machines are created automatically during device provisioning
- Dashboard can only update machine status, operator, and metadata
- Telemetry readings always reference a machine via machineId
- When telemetry is received, the device's lastSeenAt timestamp is updated
