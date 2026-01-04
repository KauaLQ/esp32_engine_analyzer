import { MachineStatus } from '../../../../prisma/prisma.types';
export declare enum OrderDirection {
    ASC = "asc",
    DESC = "desc"
}
export declare enum OrderField {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt"
}
export declare class MachineQueryDto {
    search?: string;
    status?: MachineStatus;
    patioId?: string;
    limit?: number;
    order?: OrderDirection;
    orderBy?: OrderField;
}
