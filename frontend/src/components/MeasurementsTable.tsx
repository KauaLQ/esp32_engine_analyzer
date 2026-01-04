import { Table, Text, Paper, Title, Badge } from '@mantine/core';
import type {Measurement} from "../services/api.ts";

interface MeasurementsTableProps {
  measurements: Measurement[];
  temperatureThreshold?: number;
  currentThreshold?: number;
}

export function MeasurementsTable({ 
  measurements, 
  temperatureThreshold = 60, 
  currentThreshold = 12 
}: MeasurementsTableProps) {
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Check if a value exceeds its threshold
  const isExceedingThreshold = (value: number, threshold: number) => value > threshold;

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={3} mb="md">Recent Measurements</Title>
      
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Timestamp</Table.Th>
            <Table.Th>Temperature (°C)</Table.Th>
            <Table.Th>Current (A)</Table.Th>
            <Table.Th>Voltage (V)</Table.Th>
            <Table.Th>Vibration</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {measurements.length > 0 ? (
            measurements.map((measurement) => (
              <Table.Tr key={measurement.id}>
                <Table.Td>
                  <Text size="sm">{formatDate(measurement.timestamp)}</Text>
                </Table.Td>
                <Table.Td>
                  {isExceedingThreshold(measurement.temperature, temperatureThreshold) ? (
                    <Badge color="red" variant="light">
                      {measurement.temperature.toFixed(1)}
                    </Badge>
                  ) : (
                    <Text>{measurement.temperature.toFixed(1)}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {isExceedingThreshold(measurement.current, currentThreshold) ? (
                    <Badge color="red" variant="light">
                      {measurement.current.toFixed(2)}
                    </Badge>
                  ) : (
                    <Text>{measurement.current.toFixed(2)}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text>{measurement.voltage.toFixed(1)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text>{measurement.vibration.toFixed(2)}</Text>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text ta="center" py="md">No measurements available</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

export default MeasurementsTable;
