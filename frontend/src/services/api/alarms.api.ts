import http from '../../lib/api/http';
import type { 
  AlarmListResponse, 
  AlarmBase, 
  AlarmCreateRequest,
  AlarmQueryParams
} from '../../types/alarms';

// Alarms API service
const alarmsApi = {
  // Get alarms list
  getAlarms: async (params?: AlarmQueryParams): Promise<AlarmListResponse> => {
    const response = await http.get<AlarmListResponse>('/alarms', { params });
    return response.data;
  },

  // Get alarm by ID
  getAlarm: async (id: string): Promise<AlarmBase> => {
    const response = await http.get<AlarmBase>(`/alarms/${id}`);
    return response.data;
  },

  // Create alarm
  createAlarm: async (data: AlarmCreateRequest): Promise<AlarmBase> => {
    const response = await http.post<AlarmBase>('/alarms', data);
    return response.data;
  },

  // Delete alarm
  deleteAlarm: async (id: string): Promise<void> => {
    await http.delete(`/alarms/${id}`);
  },

  // Acknowledge alarm
  acknowledgeAlarm: async (id: string): Promise<AlarmBase> => {
    const response = await http.post<AlarmBase>(`/alarms/${id}/ack`);
    return response.data;
  },

  // Close alarm
  closeAlarm: async (id: string): Promise<AlarmBase> => {
    const response = await http.post<AlarmBase>(`/alarms/${id}/close`);
    return response.data;
  }
};

export default alarmsApi;
