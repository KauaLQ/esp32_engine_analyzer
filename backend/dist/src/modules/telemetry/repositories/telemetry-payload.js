"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTelemetryPayload = toTelemetryPayload;
function toTelemetryPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Invalid telemetry payload (not an object)');
    }
    const obj = payload;
    const voltageV = Number(obj.voltageV);
    const currentA = Number(obj.currentA);
    const temperatureC = Number(obj.temperatureC);
    const seq = Number(obj.seq);
    if (![voltageV, currentA, temperatureC, seq].every(Number.isFinite)) {
        throw new Error('Invalid telemetry payload (non-numeric fields)');
    }
    return { voltageV, currentA, temperatureC, seq };
}
//# sourceMappingURL=telemetry-payload.js.map