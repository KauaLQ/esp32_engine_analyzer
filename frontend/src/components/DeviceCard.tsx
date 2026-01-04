import { Card, Text, Group, Badge, useMantineTheme, rem, Grid, Tooltip } from '@mantine/core';
import { IconMapPin, IconTemperature, IconBolt, IconWaveSine, IconBatteryFilled } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type {Device} from "../services/api.ts";

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const theme = useMantineTheme();

  // Determine status color based on device status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Operante':
        return 'green';
      case 'Anomalia':
        return 'yellow';
      case 'Inoperante':
        return 'red';
      default:
        return 'blue';
    }
  };

  // Format status text for display
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'Operante':
        return 'Operante';
      case 'Anomalia':
        return 'Anomalia';
      case 'Inoperante':
        return 'Inoperante';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      component={Link}
      to={`/device/${device.device_id}`}
      style={{ 
        textDecoration: 'none', 
        color: 'inherit',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows.md,
        },
      }}
    >
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500} size="lg">{device.name || `Dispositivo ${device.device_id}`}</Text>
          <Badge color={getStatusColor(device.status)} variant="light">
            {getStatusText(device.status)}
          </Badge>
        </Group>
      </Card.Section>

      {/* Average measurements */}
      <Card.Section withBorder inheritPadding py="md" mt="md">
        <Text size="sm" fw={500} mb="xs">Médias de medições:</Text>
        <Grid>
          {/* Temperature */}
          <Grid.Col span={6}>
            <Tooltip label="Temperatura média">
              <Group gap="xs">
                <IconTemperature style={{ width: rem(16), height: rem(16) }} stroke={1.5} color={theme.colors.red[6]} />
                <Text size="sm">{device.avgTemperature !== undefined ? `${device.avgTemperature.toFixed(1)}°C` : 'N/A'}</Text>
              </Group>
            </Tooltip>
          </Grid.Col>

          {/* Voltage */}
          <Grid.Col span={6}>
            <Tooltip label="Tensão média">
              <Group gap="xs">
                <IconBatteryFilled style={{ width: rem(16), height: rem(16) }} stroke={1.5} color={theme.colors.blue[6]} />
                <Text size="sm">{device.avgVoltage !== undefined ? `${device.avgVoltage.toFixed(1)}V` : 'N/A'}</Text>
              </Group>
            </Tooltip>
          </Grid.Col>

          {/* Current */}
          <Grid.Col span={6}>
            <Tooltip label="Corrente média">
              <Group gap="xs">
                <IconBolt style={{ width: rem(16), height: rem(16) }} stroke={1.5} color={theme.colors.yellow[6]} />
                <Text size="sm">{device.avgCurrent !== undefined ? `${device.avgCurrent.toFixed(1)}A` : 'N/A'}</Text>
              </Group>
            </Tooltip>
          </Grid.Col>

          {/* Vibration */}
          <Grid.Col span={6}>
            <Tooltip label="Vibração média">
              <Group gap="xs">
                <IconWaveSine style={{ width: rem(16), height: rem(16) }} stroke={1.5} color={theme.colors.grape[6]} />
                <Text size="sm">{device.avgVibration !== undefined ? `${device.avgVibration.toFixed(1)}` : 'N/A'}</Text>
              </Group>
            </Tooltip>
          </Grid.Col>
        </Grid>
      </Card.Section>

      {/* Location */}
      {device.location && (
        <Group mt="md" gap="xs" ta={'center'} >
          <IconMapPin style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          <Text size="sm" ta={'center'}>{device.location}</Text>
        </Group>
      )}
    </Card>
  );
}

export default DeviceCard;
