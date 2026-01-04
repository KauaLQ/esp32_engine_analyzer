import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePatioDto, PatioDto, PatioPublicDto, PatioQueryDto, UpdatePatioDto } from '../domain/dto';
import { MachinesInPatioQueryDto } from '../domain/dto';
export declare class PatiosRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePatioDto): Promise<PatioDto>;
    findAll(query: PatioQueryDto): Promise<{
        data: PatioDto[];
        total: number;
        limit: number;
        hasMore: boolean;
    }>;
    findPublic(): Promise<PatioPublicDto[]>;
    findOne(id: string): Promise<PatioDto | null>;
    update(id: string, dto: UpdatePatioDto): Promise<PatioDto | null>;
    delete(id: string): Promise<boolean>;
    findMachinesInPatio(patioId: string, query: MachinesInPatioQueryDto): Promise<{
        data: {
            id: string;
            machineKey: string;
            patioId: string | null;
            patioName: string | undefined;
            manufacturer: string;
            model: string;
            status: import(".prisma/client").$Enums.machine_status;
            operatorUserId: string | null;
            meta: Record<string, any>;
            createdAt: Date;
            updatedAt: Date;
            device: {
                deviceId: string;
                fwVersion: string | null;
                lastSeenAt: Date | null;
                status: import(".prisma/client").$Enums.device_status;
            } | undefined;
        }[];
        total: number;
        limit: number;
        hasMore: boolean;
    }>;
    private mapToPatioDto;
}
