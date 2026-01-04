export declare enum UserRole {
    admin = "admin",
    operator = "operator",
    viewer = "viewer"
}
export declare enum UserStatus {
    active = "active",
    disabled = "disabled"
}
export declare enum MachineStatus {
    operante = "operante",
    inoperante = "inoperante",
    manutencao = "manutencao"
}
export declare enum AlarmSeverity {
    info = "info",
    warn = "warn",
    crit = "crit"
}
export declare enum AlarmStatus {
    open = "open",
    ack = "ack",
    closed = "closed"
}
export type SortOrder = 'asc' | 'desc';
export type JsonValue = any;
export type JsonObject = Record<string, any>;
export interface UserEntity {
    id: string;
    email: string;
    password_hash: string;
    full_name?: string | null;
    role: UserRole;
    status: UserStatus;
    last_login_at?: Date | null;
    tenant_id?: string | null;
}
