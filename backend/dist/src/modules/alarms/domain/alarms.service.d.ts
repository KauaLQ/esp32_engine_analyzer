import { AlarmsRepository } from '../repositories/alarms.repository';
import { AlarmDto, AlarmQueryDto, AlarmSeverity, CreateAlarmDto, PaginatedResponseDto } from './dto';
export declare class AlarmsService {
    private readonly alarmsRepository;
    constructor(alarmsRepository: AlarmsRepository);
    create(createDto: CreateAlarmDto, userId?: string): Promise<AlarmDto>;
    findAll(query: AlarmQueryDto): Promise<PaginatedResponseDto<AlarmDto>>;
    findById(id: string): Promise<AlarmDto>;
    acknowledge(id: string, userId: string): Promise<AlarmDto>;
    close(id: string, userId: string): Promise<AlarmDto>;
    delete(id: string): Promise<void>;
    createOrUpdateThresholdAlarm(machineId: string, dedupeKey: string, severity: AlarmSeverity, title: string, details: Record<string, any>): Promise<AlarmDto>;
    closeThresholdAlarm(machineId: string, dedupeKey: string): Promise<void>;
    private isSeverityHigher;
}
