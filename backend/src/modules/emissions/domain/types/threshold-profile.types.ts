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

export function getEmissionInputsFromProfile(payload: ThresholdProfilePayload) {
  const fp = Number(payload?.nominais?.assumptions?.fp ?? 0.85);
  const eta = Number(payload?.nominais?.assumptions?.eta ?? 0.90);
  const vrmsNom = Number(payload?.nominais?.vrms_nominal_v ?? payload?.regime?.vrms_nominal_v ?? 220);
  const irmsNom = payload?.nominais?.irms_nominal_a != null ? Number(payload.nominais.irms_nominal_a) : null;
  return { fp, eta, vrmsNom, irmsNom };
}
