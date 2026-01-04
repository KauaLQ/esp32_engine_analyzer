import { MachineStatus } from '../../../../prisma/prisma.types';
export declare class MetaDto {
    tag?: string;
    powerKw?: number;
    voltageNominal?: number;
    notes?: string;
}
export declare class ProvisionRequestDto {
    deviceId: string;
    machineKey: string;
    patioId?: string;
    manufacturer?: string;
    model?: string;
    status?: MachineStatus;
    operatorUserId?: string;
    meta?: MetaDto;
    fwVersion?: string;
}
