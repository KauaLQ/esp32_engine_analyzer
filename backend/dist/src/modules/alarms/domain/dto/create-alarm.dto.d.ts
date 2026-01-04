import { AlarmSeverity } from './alarm.dto';
export declare class CreateAlarmDto {
    machineId: string;
    type?: string;
    severity: AlarmSeverity;
    title: string;
    details?: Record<string, any>;
    dedupeKey?: string;
}
