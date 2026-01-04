import { MachineStatus } from '../../../../prisma/prisma.types';
export declare class UpdateMachineDto {
    status?: MachineStatus;
    operatorUserId?: string | null;
    manufacturer?: string;
    model?: string;
    patioId?: string | null;
    meta?: Record<string, any>;
}
