import { AlarmsService } from '../domain/alarms.service';
import { AlarmDto, AlarmQueryDto, CreateAlarmDto, PaginatedResponseDto } from '../domain/dto';
export declare class AlarmsController {
    private readonly alarmsService;
    constructor(alarmsService: AlarmsService);
    findAll(query: AlarmQueryDto): Promise<PaginatedResponseDto<AlarmDto>>;
    findOne(id: string): Promise<AlarmDto>;
    create(createDto: CreateAlarmDto, req: any): Promise<AlarmDto>;
    acknowledge(id: string, req: any): Promise<AlarmDto>;
    close(id: string, req: any): Promise<AlarmDto>;
    delete(id: string): Promise<void>;
}
