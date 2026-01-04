import { PrismaService } from '../../../prisma/prisma.service';
import { AlarmDto, AlarmQueryDto, AlarmSeverity, AlarmStatus, CreateAlarmDto } from '../domain/dto';
export declare class AlarmsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateAlarmDto, userId?: string): Promise<AlarmDto>;
    findAll(query: AlarmQueryDto): Promise<{
        data: AlarmDto[];
        total: number;
        limit: number;
        hasMore: boolean;
    }>;
    findById(id: string): Promise<AlarmDto | null>;
    findByDedupeKey(machineId: string, dedupeKey: string, status: AlarmStatus): Promise<AlarmDto | null>;
    updateLastSeen(id: string): Promise<AlarmDto>;
    updateSeverity(id: string, severity: AlarmSeverity): Promise<AlarmDto>;
    updateDetails(id: string, title: string, details: Record<string, any>): Promise<AlarmDto>;
    acknowledge(id: string, userId: string): Promise<AlarmDto>;
    close(id: string, userId: string): Promise<AlarmDto>;
    delete(id: string): Promise<void>;
    private mapToAlarmDto;
}
