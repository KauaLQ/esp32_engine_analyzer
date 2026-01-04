import { MachineStatus } from '../../../../prisma/prisma.types';
export declare class DeviceDto {
    id: string;
    deviceId: string;
    fwVersion?: string | null;
    lastSeenAt?: Date | null;
    pairedAt?: Date | null;
}
export declare class MachineDto {
    id: string;
    machineKey: string;
    patioId?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    status: MachineStatus;
    operatorUserId?: string | null;
    meta: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    device?: DeviceDto;
    lastSeenAt?: Date | null;
}
export declare class MachineDetailDto extends MachineDto {
    latestReading?: Record<string, any>;
}
