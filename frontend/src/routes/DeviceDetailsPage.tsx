import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Group, 
  Badge, 
  Button, 
  Paper,
  Text, 
  Skeleton, 
  Alert,
  SimpleGrid,
  ThemeIcon,
  rem
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconTemperature, 
  IconBolt, 
  IconWaveSine, 
  IconAlertCircle,
  IconDeviceAnalytics
} from '@tabler/icons-react';
import { MeasurementsTable } from '../components/MeasurementsTable';
import { MeasurementsChart } from '../components/MeasurementsChart';
import {
  getAllMeasurements,
  getLatestMeasurements,
  getDevice,
  type Measurement, 
  type Device
} from '../services/api';

// Constants for thresholds
const TEMPERATURE_THRESHOLD = 60; // °C
const CURRENT_THRESHOLD = 12; // A

export function DeviceDetailsPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Find the latest measurement
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  // Check if any measurement exceeds thresholds
  const hasTemperatureAlert = latestMeasurement && latestMeasurement.temperature > TEMPERATURE_THRESHOLD;
  const hasCurrentAlert = latestMeasurement && latestMeasurement.current > CURRENT_THRESHOLD;

  // Fetch initial measurements
  const fetchMeasurements = useCallback(async () => {
    if (!deviceId) return;

    try {
      // Get all historical measurements for the device
      const data = await getAllMeasurements(deviceId);

      // Sort by timestamp (newest first)
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setMeasurements(data);

      // Check for alerts
      if (data.length > 0) {
        checkForAlerts(data[0]);
      }
    } catch (err) {
      setError(`Falha ao carregar medições para o dispositivo ${deviceId}`);
      console.error(err);
    }
  }, [deviceId]);

  // Fetch device info and initial measurements
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!deviceId) {
        navigate('/');
        return;
      }

      setLoading(true);

      try {
        // Get device info from API
        const deviceInfo = await getDevice(deviceId);
        setDevice(deviceInfo);

        // Fetch measurements
        await fetchMeasurements();
      } catch (err) {
        setError(`Dispositivo com ID ${deviceId} não encontrado`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [deviceId, navigate, fetchMeasurements]);

  // Set up polling for latest measurements
  useEffect(() => {
    if (!deviceId || loading) return;

    const fetchLatestData = async () => {
      try {
        const latestData = await getLatestMeasurements(deviceId);

        if (latestData.length > 0) {
          // Add new measurement to the beginning of the array only if it's different from the last one
          setMeasurements(prev => {
            // Check if the new measurement is different from the last one
            const latestMeasurement = latestData[0];
            const prevMeasurement = prev.length > 0 ? prev[0] : null;

            // If there's no previous measurement or the new one is different, add it
            if (!prevMeasurement || 
                prevMeasurement.temperature !== latestMeasurement.temperature || 
                prevMeasurement.current !== latestMeasurement.current || 
                prevMeasurement.voltage !== latestMeasurement.voltage || 
                prevMeasurement.vibration !== latestMeasurement.vibration) {
              // Add the new measurement to the beginning of the array without limiting the size
              return [latestMeasurement, ...prev];
            }

            // If the new measurement is the same as the last one, ignore it
            return prev;
          });

          // Check for alerts
          checkForAlerts(latestData[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar medições mais recentes:', err);
      }
    };

    // Poll every 5 seconds
    const intervalId = setInterval(fetchLatestData, 5000);

    return () => clearInterval(intervalId);
  }, [deviceId, loading]);

  // Check for alerts based on thresholds
  const checkForAlerts = (measurement: Measurement) => {
    if (!measurement) return;

    if (measurement.temperature > TEMPERATURE_THRESHOLD) {
      setAlertMessage(`Temperatura elevada detectada: ${measurement.temperature.toFixed(1)}°C`);
    } else if (measurement.current > CURRENT_THRESHOLD) {
      setAlertMessage(`Corrente elevada detectada: ${measurement.current.toFixed(2)}A`);
    } else {
      setAlertMessage(null);
    }
  };

  // Get status color based on alerts
  const getStatusColor = () => {
    if (hasTemperatureAlert || hasCurrentAlert) {
      return 'red';
    }

    if (device?.status === 'Anomalia') {
      return 'yellow';
    }

    if (device?.status === 'Operante') {
      return 'green';
    }

    return 'gray';
  };

  // Get status text
  const getStatusText = () => {
    if (hasTemperatureAlert) {
      return 'Alerta de Temperatura';
    }

    if (hasCurrentAlert) {
      return 'Alerta de Corrente';
    }

    return device?.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : 'Desconhecido';
  };

  return (
    <Container size="xl" py="xl">
      {/* Back button */}
      <Button 
        variant="subtle" 
        leftSection={<IconArrowLeft size={16} />} 
        onClick={() => navigate('/')}
        mb="md"
      >
        Voltar para listagem de dispositivos
      </Button>

      {/* Error message */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red" mb="xl">
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <>
          <Skeleton height={50} width="70%" mb="xl" />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={400} radius="md" mb="xl" />
          <Skeleton height={300} radius="md" />
        </>
      ) : (
        <>
          {/* Device header */}
          <Group mb="xl" align="center">
            <ThemeIcon size={50} radius="md" variant="light" color="blue">
              <IconDeviceAnalytics size={30} stroke={1.5} />
            </ThemeIcon>
            <div>
              <Title order={1}>{device?.name || `Dispositivo ${deviceId}`}</Title>
              <Group gap="xs">
                <Badge color={getStatusColor()} size="lg">
                  {getStatusText()}
                </Badge>
                {device?.location && (
                  <Badge color="blue" variant="outline">
                    {device.location}
                  </Badge>
                )}
                <Text size="sm" c="dimmed">ID: {deviceId}</Text>
              </Group>
            </div>
          </Group>

          {/* Alert message */}
          {alertMessage && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Alerta" 
              color="red" 
              mb="xl"
              withCloseButton
              onClose={() => setAlertMessage(null)}
            >
              {alertMessage}
            </Alert>
          )}

          {/* Metrics cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
            {/* Temperature card */}
            <Paper shadow="xs" p="md" withBorder>
              <Group>
                <ThemeIcon 
                  size="lg" 
                  radius="md" 
                  color={hasTemperatureAlert ? 'red' : 'blue'}
                  variant="light"
                >
                  <IconTemperature size={rem(20)} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">Temperatura</Text>
                  <Text size="xl" fw={700} c={hasTemperatureAlert ? 'red' : undefined}>
                    {latestMeasurement ? `${latestMeasurement.temperature.toFixed(1)} °C` : 'N/D'}
                  </Text>
                </div>
              </Group>
            </Paper>

            {/* Current card */}
            <Paper shadow="xs" p="md" withBorder>
              <Group>
                <ThemeIcon 
                  size="lg" 
                  radius="md" 
                  color={hasCurrentAlert ? 'red' : 'blue'}
                  variant="light"
                >
                  <IconBolt size={rem(20)} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">Corrente elétrica</Text>
                  <Text size="xl" fw={700} c={hasCurrentAlert ? 'red' : undefined}>
                    {latestMeasurement ? `${latestMeasurement.current.toFixed(2)} A` : 'N/D'}
                  </Text>
                </div>
              </Group>
            </Paper>

            {/* Voltage card */}
            <Paper shadow="xs" p="md" withBorder>
              <Group>
                <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                  <IconBolt size={rem(20)} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">Tensão</Text>
                  <Text size="xl" fw={700}>
                    {latestMeasurement ? `${latestMeasurement.voltage.toFixed(1)} V` : 'N/D'}
                  </Text>
                </div>
              </Group>
            </Paper>

            {/* Vibration card */}
            <Paper shadow="xs" p="md" withBorder>
              <Group>
                <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                  <IconWaveSine size={rem(20)} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">Vibração</Text>
                  <Text size="xl" fw={700}>
                    {latestMeasurement ? latestMeasurement.vibration.toFixed(2) + " m/s²" : 'N/D'}
                  </Text>
                </div>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* Chart */}
          <MeasurementsChart 
            measurements={measurements} 
            temperatureThreshold={TEMPERATURE_THRESHOLD}
            currentThreshold={CURRENT_THRESHOLD}
          />

          {/* Table */}
          <div style={{ marginTop: '2rem' }}>
            <MeasurementsTable 
              measurements={measurements.slice(0, 10)} 
              temperatureThreshold={TEMPERATURE_THRESHOLD}
              currentThreshold={CURRENT_THRESHOLD}
            />
          </div>
        </>
      )}
    </Container>
  );
}

export default DeviceDetailsPage;
