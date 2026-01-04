import { ThresholdsRepository } from '../repositories/thresholds.repository';
import { AlarmsService } from '../../alarms/domain/alarms.service';
interface TelemetryReading {
    machineId: string;
    ts: string;
    voltageV?: number;
    currentA?: number;
    temperatureC?: number;
    seq?: number;
}
export declare class ThresholdEvaluationService {
    private readonly thresholdsRepository;
    private readonly alarmsService;
    private readonly logger;
    constructor(thresholdsRepository: ThresholdsRepository, alarmsService: AlarmsService);
    evaluateAndEmitAlarms(machineId: string, reading: TelemetryReading): Promise<void>;
    private evaluateVoltage;
    private evaluateCurrent;
    private evaluateTemperature;
    private createVoltageAlarm;
    private createCurrentAlarm;
    private createTemperatureAlarm;
}
export {};
