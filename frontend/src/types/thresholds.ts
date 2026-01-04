// Threshold types

// Threshold mode
export type ThresholdMode = 'MANUAL' | 'AI';

// Threshold payload
export interface ThresholdPayload {
  regime?: Record<string, any>;
  nominais?: Record<string, any>;
  thresholds?: {
    voltage?: {
      warn_low_v?: number;
      crit_low_v?: number;
      warn_high_v?: number;
      crit_high_v?: number;
      hard_min_v?: number;
      hard_max_v?: number;
    };
    current?: {
      warn_high_a?: number;
      crit_high_a?: number;
      hard_max_a?: number;
    };
    temperature_tcase?: {
      warn_high_c?: number;
      crit_high_c?: number;
      hard_max_c?: number;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

// Threshold base
export interface ThresholdBase {
  id: string;
  machineId: string;
  mode: ThresholdMode;
  active: boolean;
  version: number;
  payload: ThresholdPayload;
  aiRequest?: Record<string, any>;
  aiResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Threshold manual create request
export interface ThresholdManualCreateRequest {
  payload: ThresholdPayload;
  notes?: string[];
}

// Threshold AI create request
export interface ThresholdAICreateRequest {
  manufacturer: string;
  model: string;
}

// Threshold list response
export type ThresholdListResponse = ThresholdBase[];
