export declare enum AlarmSeverity {
    INFO = "info",
    WARN = "warn",
    CRIT = "crit"
}
export declare enum AlarmStatus {
    OPEN = "open",
    ACK = "ack",
    CLOSED = "closed"
}
export declare class AlarmDto {
    id: string;
    machineId: string;
    type: string;
    severity: AlarmSeverity;
    status: AlarmStatus;
    title: string;
    details: Record<string, any>;
    openedAt: string;
    lastSeenAt: string;
    ackAt?: string;
    closedAt?: string;
    dedupeKey?: string;
}
