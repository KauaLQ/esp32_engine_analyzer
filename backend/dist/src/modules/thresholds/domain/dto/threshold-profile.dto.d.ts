export declare class ThresholdProfileDto {
    id: string;
    machineId: string;
    mode: 'MANUAL' | 'AI_N8N';
    active: boolean;
    version: number;
    payload: Record<string, any>;
    aiRequest?: Record<string, any>;
    aiResponse?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
