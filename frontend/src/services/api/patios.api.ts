import http from '../../lib/api/http';
import type { 
  PatioListResponse, 
  PatioBase, 
  PatioPublicListResponse,
  PatioCreateRequest,
  PatioUpdateRequest,
  PatioQueryParams
} from '../../types/patios';
import type { MachineListResponse, MachineQueryParams } from '../../types/machines';

// Patios API service
const patiosApi = {
  // Get public patios
  getPublicPatios: async (): Promise<PatioPublicListResponse> => {
    const response = await http.get<PatioPublicListResponse>('/patios/public');
    return response.data;
  },

  // Create patio
  createPatio: async (data: PatioCreateRequest): Promise<PatioBase> => {
    const response = await http.post<PatioBase>('/patios', data);
    return response.data;
  },

  // Get patios list
  getPatios: async (params?: PatioQueryParams): Promise<PatioListResponse> => {
    const response = await http.get<PatioListResponse>('/patios', { params });
    return response.data;
  },

  // Get patio by ID
  getPatio: async (id: string): Promise<PatioBase> => {
    const response = await http.get<PatioBase>(`/patios/${id}`);
    return response.data;
  },

  // Update patio
  updatePatio: async (id: string, data: PatioUpdateRequest): Promise<PatioBase> => {
    const response = await http.patch<PatioBase>(`/patios/${id}`, data);
    return response.data;
  },

  // Delete patio
  deletePatio: async (id: string): Promise<void> => {
    await http.delete(`/patios/${id}`);
  },

  // Get machines in patio
  getPatioMachines: async (id: string, params?: MachineQueryParams): Promise<MachineListResponse> => {
    const response = await http.get<MachineListResponse>(`/patios/${id}/machines`, { params });
    return response.data;
  }
};

export default patiosApi;
