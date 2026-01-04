import { OrderDirection } from './patio-query.dto';
import { MachineStatus } from '../../../../prisma/prisma.types';
export declare class MachinesInPatioQueryDto {
    search?: string;
    status?: MachineStatus;
    limit?: number;
    order?: OrderDirection;
}
