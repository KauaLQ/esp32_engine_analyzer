import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hackaton-rotorial.onrender.com';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Define TypeScript interfaces for the data structures
export interface Device {
  device_id: string;
  name?: string;
  location?: string;
  status?: 'Operante' | 'Anomalia' | 'Inoperante';
  avgTemperature?: number;
  avgCurrent?: number;
  avgVoltage?: number;
  avgVibration?: number;
  measurementHistory?: {
    timestamp: string;
    avgTemperature: number;
    avgCurrent: number;
    avgVoltage: number;
    avgVibration: number;
  }[];
}

export interface Measurement {
  id: string;
  device_id: string;
  timestamp: string;
  temperature: number;
  current: number;
  voltage: number;
  vibration: number;
}

// API functions
export const getDevices = async (): Promise<Device[]> => {
  try {
    const response = await api.get('/api/devices');
    return response.data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

export const getDevice = async (deviceId: string): Promise<Device> => {
  try {
    const response = await api.get(`/api/devices/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching device ${deviceId}:`, error);
    throw error;
  }
};

export const getDevicesWithAverages = async (): Promise<Device[]> => {
  try {
    // Get all devices
    let devices = await getDevices();

    // For each device, fetch measurements and calculate averages
    const devicesWithAverages = await Promise.all(
      devices.map(async (device) => {
        try {
          // Get measurements for this device (last 100 by default)
          const measurements = await getMeasurements(device.device_id);

          if (measurements.length > 0) {
            // Calculate averages
            const avgTemperature = measurements.reduce((sum, m) => sum + m.temperature, 0) / measurements.length;
            const avgCurrent = measurements.reduce((sum, m) => sum + m.current, 0) / measurements.length;
            const avgVoltage = measurements.reduce((sum, m) => sum + m.voltage, 0) / measurements.length;
            const avgVibration = measurements.reduce((sum, m) => sum + m.vibration, 0) / measurements.length;

            // Group measurements by hour for history tracking
            const measurementsByHour = new Map<string, { 
              temps: number[], 
              currents: number[], 
              voltages: number[], 
              vibrations: number[] 
            }>();

            measurements.forEach(m => {
              const date = new Date(m.timestamp);
              const hourKey = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:00`;

              if (!measurementsByHour.has(hourKey)) {
                measurementsByHour.set(hourKey, { 
                  temps: [], 
                  currents: [], 
                  voltages: [], 
                  vibrations: [] 
                });
              }

              const hourData = measurementsByHour.get(hourKey)!;
              hourData.temps.push(m.temperature);
              hourData.currents.push(m.current);
              hourData.voltages.push(m.voltage);
              hourData.vibrations.push(m.vibration);
            });

            // Calculate hourly averages
            const measurementHistory = Array.from(measurementsByHour.entries())
              .map(([timestamp, data]) => {
                const avgTemp = data.temps.reduce((sum, t) => sum + t, 0) / data.temps.length;
                const avgCurr = data.currents.reduce((sum, c) => sum + c, 0) / data.currents.length;
                const avgVolt = data.voltages.reduce((sum, v) => sum + v, 0) / data.voltages.length;
                const avgVib = data.vibrations.reduce((sum, v) => sum + v, 0) / data.vibrations.length;

                return {
                  timestamp,
                  avgTemperature: avgTemp,
                  avgCurrent: avgCurr,
                  avgVoltage: avgVolt,
                  avgVibration: avgVib
                };
              })
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            // Return device with averages
            return {
              ...device,
              avgTemperature,
              avgCurrent,
              avgVoltage,
              avgVibration,
              measurementHistory
            };
          }

          return device;
        } catch (error) {
          console.error(`Error processing measurements for device ${device.device_id}:`, error);
          return device;
        }
      })
    );

    return devicesWithAverages;
  } catch (error) {
    console.error('Error fetching devices with averages:', error);
    throw error;
  }
};

export const getMeasurements = async (deviceId: string, limit: number = 100): Promise<Measurement[]> => {
  try {
    const response = await api.get('/api/measurements', {
      params: { device_id: deviceId, limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching measurements for device ${deviceId}:`, error);
    throw error;
  }
};

export const getAllMeasurements = async (deviceId: string): Promise<Measurement[]> => {
  try {
    // Using a very large number to effectively get all measurements
    // The backend should handle this appropriately
    const response = await api.get('/api/measurements', {
      params: { device_id: deviceId, limit: 100000 },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching all measurements for device ${deviceId}:`, error);
    throw error;
  }
};

export const getLatestMeasurements = async (deviceId: string): Promise<Measurement[]> => {
  try {
    const response = await api.get('/api/measurements/latest', {
      params: { device_id: deviceId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching latest measurements for device ${deviceId}:`, error);
    throw error;
  }
};

// Mock data for development (when API is not available)
export const mockDevices: Device[] = [
  { 
    device_id: '1', 
    name: 'Motor 1', 
    location: 'Bloco A', 
    status: 'Operante',
    avgTemperature: 45.3,
    avgCurrent: 8.7,
    avgVoltage: 230.5,
    avgVibration: 2.1,
    measurementHistory: [
      {
        timestamp: '2023-06-01 10:00',
        avgTemperature: 44.2,
        avgCurrent: 8.5,
        avgVoltage: 229.8,
        avgVibration: 2.0
      },
      {
        timestamp: '2023-06-01 11:00',
        avgTemperature: 45.3,
        avgCurrent: 8.7,
        avgVoltage: 230.5,
        avgVibration: 2.1
      }
    ]
  },
  { 
    device_id: '2', 
    name: 'Motor 2', 
    location: 'Bloco B', 
    status: 'Anomalia',
    avgTemperature: 58.7,
    avgCurrent: 12.3,
    avgVoltage: 225.1,
    avgVibration: 3.8,
    measurementHistory: [
      {
        timestamp: '2023-06-01 10:00',
        avgTemperature: 55.1,
        avgCurrent: 11.2,
        avgVoltage: 226.3,
        avgVibration: 3.2
      },
      {
        timestamp: '2023-06-01 11:00',
        avgTemperature: 58.7,
        avgCurrent: 12.3,
        avgVoltage: 225.1,
        avgVibration: 3.8
      }
    ]
  },
  { 
    device_id: '3', 
    name: 'Motor 3', 
    location: 'Bloco A', 
    status: 'Inoperante',
    avgTemperature: 30.2,
    avgCurrent: 0.5,
    avgVoltage: 220.3,
    avgVibration: 0.2,
    measurementHistory: [
      {
        timestamp: '2023-06-01 10:00',
        avgTemperature: 35.6,
        avgCurrent: 2.1,
        avgVoltage: 221.5,
        avgVibration: 0.8
      },
      {
        timestamp: '2023-06-01 11:00',
        avgTemperature: 30.2,
        avgCurrent: 0.5,
        avgVoltage: 220.3,
        avgVibration: 0.2
      }
    ]
  },
  { 
    device_id: '4', 
    name: 'Motor 4', 
    location: 'Bloco C', 
    status: 'Inoperante',
    avgTemperature: 28.5,
    avgCurrent: 0.3,
    avgVoltage: 219.8,
    avgVibration: 0.1,
    measurementHistory: [
      {
        timestamp: '2023-06-01 10:00',
        avgTemperature: 32.1,
        avgCurrent: 1.8,
        avgVoltage: 220.7,
        avgVibration: 0.6
      },
      {
        timestamp: '2023-06-01 11:00',
        avgTemperature: 28.5,
        avgCurrent: 0.3,
        avgVoltage: 219.8,
        avgVibration: 0.1
      }
    ]
  },
  { 
    device_id: '5', 
    name: 'Motor 5', 
    location: 'Bloco B', 
    status: 'Operante',
    avgTemperature: 42.8,
    avgCurrent: 7.9,
    avgVoltage: 228.6,
    avgVibration: 1.8,
    measurementHistory: [
      {
        timestamp: '2023-06-01 10:00',
        avgTemperature: 41.5,
        avgCurrent: 7.6,
        avgVoltage: 227.9,
        avgVibration: 1.7
      },
      {
        timestamp: '2023-06-01 11:00',
        avgTemperature: 42.8,
        avgCurrent: 7.9,
        avgVoltage: 228.6,
        avgVibration: 1.8
      }
    ]
  },
];

export const generateMockMeasurements = (deviceId: string, count: number = 100): Measurement[] => {
  const measurements: Measurement[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000)); // 5 minutes intervals
    measurements.push({
      id: `${deviceId}-${i}`,
      device_id: deviceId,
      timestamp: timestamp.toISOString(),
      temperature: 25 + Math.random() * 40, // 25-65°C
      current: 5 + Math.random() * 10, // 5-15A
      voltage: 220 + Math.random() * 30, // 220-250V
      vibration: Math.random() * 5, // 0-5 units
    });
  }

  return measurements;
};

export default api;
