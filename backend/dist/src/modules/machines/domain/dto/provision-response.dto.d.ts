import { MachineStatus } from '../../../../prisma/prisma.types';
export declare class MachineResponseDto {
    id: string;
    machineKey: string;
    patioId: string | null;
    manufacturer?: string;
    model?: string;
    status: MachineStatus;
    operatorUserId?: string | null;
    meta: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DeviceResponseDto {
    deviceId: string;
    fwVersion?: string | null;
    pairedAt: Date | null;
    lastSeenAt?: Date | null;
}
export declare class TelemetryInfoDto {
    machineId: string;
    httpEndpoint: string;
}
export declare class ProvisionResponseDto {
    machine: MachineResponseDto;
    device: DeviceResponseDto;
    telemetry: TelemetryInfoDto;
}
