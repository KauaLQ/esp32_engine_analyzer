import http from '../../lib/api/http';
import type { 
  ThresholdBase, 
  ThresholdListResponse,
  ThresholdManualCreateRequest,
  ThresholdAICreateRequest
} from '../../types/thresholds';

// Thresholds API service
const thresholdsApi = {
  // Get active threshold
  getActiveThreshold: async (machineId: string): Promise<ThresholdBase> => {
    const response = await http.get<ThresholdBase>(`/machines/${machineId}/thresholds`);
    return response.data;
  },

  // Get threshold history
  getThresholdHistory: async (machineId: string): Promise<ThresholdListResponse> => {
    const response = await http.get<ThresholdListResponse>(`/machines/${machineId}/thresholds/history`);
    return response.data;
  },

  // Create manual threshold
  createManualThreshold: async (machineId: string, data: ThresholdManualCreateRequest): Promise<ThresholdBase> => {
    const response = await http.post<ThresholdBase>(`/machines/${machineId}/thresholds/manual`, data);
    return response.data;
  },

  // Create AI threshold
  createAIThreshold: async (machineId: string, data: ThresholdAICreateRequest): Promise<ThresholdBase> => {
    const response = await http.post<ThresholdBase>(`/machines/${machineId}/thresholds/ai`, data);
    return response.data;
  }
};

export default thresholdsApi;
