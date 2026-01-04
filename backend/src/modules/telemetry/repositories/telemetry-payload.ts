import type { JsonObject, JsonValue } from '../../../prisma/prisma.types';

export type TelemetryPayload = {
  voltageV: number;
  currentA: number;
  temperatureC: number;
  seq: number;
};

export function toTelemetryPayload(payload: JsonValue | null): TelemetryPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid telemetry payload (not an object)');
  }

  const obj = payload as JsonObject;

  const voltageV = Number(obj.voltageV);
  const currentA = Number(obj.currentA);
  const temperatureC = Number(obj.temperatureC);
  const seq = Number(obj.seq);

  if (![voltageV, currentA, temperatureC, seq].every(Number.isFinite)) {
    throw new Error('Invalid telemetry payload (non-numeric fields)');
  }

  return { voltageV, currentA, temperatureC, seq };
}
