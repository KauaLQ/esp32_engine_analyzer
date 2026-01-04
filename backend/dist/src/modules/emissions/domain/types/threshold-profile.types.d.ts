export type ThresholdSource = 'DOCUMENT' | 'ESTIMATED' | 'DEFAULT' | 'UNKNOWN' | 'NEED_NAMEPLATE';
export interface ThresholdProfilePayload {
    notes?: string[];
    regime?: {
        vrms_nominal_v?: number;
        freq_hz?: number;
        source?: ThresholdSource;
    };
    nominais?: {
        vrms_nominal_v?: number;
        irms_nominal_a?: number;
        tcase_nominal_c?: number;
        assumptions?: {
            fp?: number;
            eta?: number;
            pout_kw?: number;
            ambient_temp_c?: number;
            formula?: string;
        };
    };
    thresholds?: unknown;
}
export declare function getEmissionInputsFromProfile(payload: ThresholdProfilePayload): {
    fp: number;
    eta: number;
    vrmsNom: number;
    irmsNom: number | null;
};
