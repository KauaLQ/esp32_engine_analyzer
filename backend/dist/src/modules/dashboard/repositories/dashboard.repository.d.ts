import { PrismaService } from '../../../prisma/prisma.service';
export declare class DashboardRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildOpenedAtWhere;
    private mapGroupByCounts;
    countMachines(): Promise<number>;
    countPatios(): Promise<number>;
    countAlarmsByStatus(from?: Date, to?: Date): Promise<{
        status: string;
        count: number;
    }[]>;
    countAlarmsBySeverity(from?: Date, to?: Date): Promise<{
        severity: string;
        count: number;
    }[]>;
    countOpenAlarmsBySeverity(from?: Date, to?: Date): Promise<{
        severity: string;
        count: number;
    }[]>;
    getAverageTelemetryValues(from: Date, to: Date): Promise<{
        avgVoltageV: number | null;
        avgCurrentA: number | null;
        avgTemperatureC: number | null;
        avgPowerKw: number | null;
        avgEnergyKwh: number | null;
        avgKgco2e: number | null;
        machinesCount: number;
        pointsCount: number;
    }>;
}
