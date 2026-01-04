import { PrismaService } from '../../../prisma/prisma.service';
import { ProvisionRequestDto } from '../domain/dto/provision-request.dto';
import { MachineQueryDto } from '../domain/dto/machine-query.dto';
import { UpdateMachineDto } from '../domain/dto/update-machine.dto';
import { MachineDto } from '../domain/dto/machine.dto';
export declare class MachinesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private toJsonObject;
    private mergeMetadata;
    private toDeviceDto;
    private toMachineDto;
    provision(dto: ProvisionRequestDto): Promise<{
        machine: {
            id: string;
            tenant_id: string | null;
            status: import(".prisma/client").$Enums.machine_status;
            created_at: Date;
            updated_at: Date;
            manufacturer: string;
            model: string;
            meta: import("@prisma/client/runtime/library").JsonValue;
            machine_key: string;
            patio_id: string | null;
            operator_user_id: string | null;
        };
        device: {
            id: string;
            tenant_id: string | null;
            status: import(".prisma/client").$Enums.device_status;
            created_at: Date;
            updated_at: Date;
            device_id: string;
            machine_id: string | null;
            fw_version: string | null;
            last_seen_at: Date | null;
            paired_at: Date | null;
        };
    }>;
    findAll(query: MachineQueryDto): Promise<{
        data: MachineDto[];
        total: number;
        limit: number;
        hasMore: boolean;
    }>;
    findOne(id: string): Promise<MachineDto | null>;
    update(id: string, dto: UpdateMachineDto): Promise<MachineDto | null>;
    updateDeviceLastSeen(machineId: string): Promise<void>;
    delete(id: string): Promise<boolean>;
}
