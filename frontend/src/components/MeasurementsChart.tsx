import { Paper, Title, useMantineTheme, SimpleGrid } from '@mantine/core';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type {Measurement} from "../services/api.ts";

interface MeasurementsChartProps {
  measurements: Measurement[];
  temperatureThreshold?: number;
  currentThreshold?: number;
}

export function MeasurementsChart({ 
  measurements, 
  temperatureThreshold = 60, 
  currentThreshold = 12 
}: MeasurementsChartProps) {
  const theme = useMantineTheme();

  // Format the data for the chart, filtering out duplicate measurements
  const processedMeasurements = measurements.reduce((acc: Measurement[], current: Measurement) => {
    // If this is the first measurement or it's different from the last one, add it
    if (acc.length === 0 || 
        acc[0].temperature !== current.temperature || 
        acc[0].current !== current.current || 
        acc[0].voltage !== current.voltage || 
        acc[0].vibration !== current.vibration) {
      return [current, ...acc];
    }
    return acc;
  }, []);

  // Format the data for the charts
  const chartData = processedMeasurements.map(m => ({
    timestamp: new Date(m.timestamp).toLocaleTimeString(),
    temperature: m.temperature,
    current: m.current,
    voltage: m.voltage,
    vibration: m.vibration,
    // Add reference lines for thresholds
    temperatureThreshold,
    currentThreshold,
  })).reverse(); // Most recent data on the right

  // Define colors for the chart lines
  const colors = {
    temperature: theme.colors.red[6],
    current: theme.colors.blue[6],
    voltage: theme.colors.yellow[6],
    vibration: theme.colors.grape[6],
    temperatureThreshold: theme.colors.red[3],
    currentThreshold: theme.colors.blue[3],
  };

  // Format the tooltip values
  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'temperature':
        return [value.toFixed(1), 'Temperatura (°C)'];
      case 'current':
        return [value.toFixed(2), 'Corrente (A)'];
      case 'voltage':
        return [value.toFixed(1), 'Tensão (V)'];
      case 'vibration':
        return [value.toFixed(2), 'Vibração'];
      case 'temperatureThreshold':
        return [value.toFixed(1), 'Limite de Temp. (°C)'];
      case 'currentThreshold':
        return [value.toFixed(2), 'Limite de Corrente (A)'];
      default:
        return [value.toString(), name];
    }
  };

  // Temperature Chart
  const TemperatureChart = () => (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={3} mb="md">Temperatura ao Longo do Tempo</Title>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            label={{ value: 'Tempo', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={formatTooltipValue} />
          <Legend />

          {/* Temperature bars */}
          <Bar
            dataKey="temperature"
            fill={colors.temperature}
            name="Temperatura"
          />

          {/* Temperature threshold reference line */}
          <Line
            type="monotone"
            dataKey="temperatureThreshold"
            stroke={colors.temperatureThreshold}
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
            name="Limite de Temp."
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Current Chart
  const CurrentChart = () => (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={3} mb="md">Corrente ao Longo do Tempo</Title>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            label={{ value: 'Tempo', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis label={{ value: 'Corrente (A)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={formatTooltipValue} />
          <Legend />

          {/* Current line */}
          <Line
            type="monotone"
            dataKey="current"
            stroke={colors.current}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Corrente"
          />

          {/* Current threshold reference line */}
          <Line
            type="monotone"
            dataKey="currentThreshold"
            stroke={colors.currentThreshold}
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
            name="Limite de Corrente"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Voltage Chart
  const VoltageChart = () => (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={3} mb="md">Tensão ao Longo do Tempo</Title>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            label={{ value: 'Tempo', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis label={{ value: 'Tensão (V)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={formatTooltipValue} />
          <Legend />

          {/* Voltage line */}
          <Line
            type="monotone"
            dataKey="voltage"
            stroke={colors.voltage}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Tensão"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );

  // Vibration Chart
  const VibrationChart = () => (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={3} mb="md">Vibração ao Longo do Tempo</Title>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            label={{ value: 'Tempo', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis label={{ value: 'Vibração', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={formatTooltipValue} />
          <Legend />

          {/* Vibration line */}
          <Line
            type="monotone"
            dataKey="vibration"
            stroke={colors.vibration}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name="Vibração"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );

  return (
    <SimpleGrid cols={2} spacing="xl">
      <TemperatureChart />
      <CurrentChart />
      <VoltageChart />
      <VibrationChart />
    </SimpleGrid>
  );
}

export default MeasurementsChart;
