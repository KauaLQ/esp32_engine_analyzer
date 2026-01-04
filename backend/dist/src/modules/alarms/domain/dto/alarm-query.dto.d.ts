import { AlarmSeverity, AlarmStatus } from './alarm.dto';
export declare class AlarmQueryDto {
    machineId?: string;
    status?: AlarmStatus;
    severity?: AlarmSeverity;
    from?: string;
    to?: string;
    limit?: number;
}
