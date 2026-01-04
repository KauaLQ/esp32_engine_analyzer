import http from '../../lib/api/http';
import type { 
  MachineListResponse, 
  MachineDetail, 
  MachineUpdateRequest,
  MachineQueryParams
} from '../../types/machines';

// Machines API service
const machinesApi = {
  // Get machines list
  getMachines: async (params?: MachineQueryParams): Promise<MachineListResponse> => {
    const response = await http.get<MachineListResponse>('/machines', { params });
    return response.data;
  },

  // Get machine by ID
  getMachine: async (id: string): Promise<MachineDetail> => {
    const response = await http.get<MachineDetail>(`/machines/${id}`);
    return response.data;
  },

  // Update machine
  updateMachine: async (id: string, data: MachineUpdateRequest): Promise<MachineDetail> => {
    const response = await http.patch<MachineDetail>(`/machines/${id}`, data);
    return response.data;
  }
};

export default machinesApi;
