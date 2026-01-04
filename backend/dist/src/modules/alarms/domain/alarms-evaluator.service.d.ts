import { AlarmsService } from './alarms.service';
import { ThresholdsRepository } from '../../thresholds/repositories/thresholds.repository';
interface TelemetryReading {
    machineId: string;
    ts: string;
    voltageV?: number;
    currentA?: number;
    temperatureC?: number;
    seq?: number;
}
export declare class AlarmsEvaluatorService {
    private readonly alarmsService;
    private readonly thresholdsRepository;
    private readonly logger;
    constructor(alarmsService: AlarmsService, thresholdsRepository: ThresholdsRepository);
    evaluateAndUpsert(machineId: string, reading: TelemetryReading): Promise<void>;
    private evaluateVoltage;
    private evaluateCurrent;
    private evaluateTemperature;
    private createOrUpdateAlarm;
    private getMetricName;
}
export {};
