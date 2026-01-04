import type { JsonValue } from '../../../prisma/prisma.types';
export type TelemetryPayload = {
    voltageV: number;
    currentA: number;
    temperatureC: number;
    seq: number;
};
export declare function toTelemetryPayload(payload: JsonValue | null): TelemetryPayload;
