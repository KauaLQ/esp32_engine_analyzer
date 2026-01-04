import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Grid, 
  TextInput, 
  Select, 
  Group, 
  Paper, 
  Skeleton,
  Alert
} from '@mantine/core';
import { IconSearch, IconMapPin, IconAlertCircle } from '@tabler/icons-react';
import { DeviceCard } from '../components/DeviceCard';
import {type Device, getDevicesWithAverages} from '../services/api';

export function DeviceListPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get unique locations from devices for the filter dropdown
  const locations = [...new Set(devices.map(device => device.location).filter(Boolean))];

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await getDevicesWithAverages();
        setDevices(data);
        setFilteredDevices(data);
      } catch (err) {
        setError('Failed to load devices. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Filter devices when search query or location filter changes
  useEffect(() => {
    let result = devices;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        device => 
          device.name?.toLowerCase().includes(query) || 
          device.device_id.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (locationFilter) {
      result = result.filter(device => device.location === locationFilter);
    }

    setFilteredDevices(result);
  }, [searchQuery, locationFilter, devices]);

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">Dispositivos monitorados</Title>

      {/* Search and filters */}
      <Paper shadow="xs" p="md" mb="xl">
        <Group align="flex-end">
          <TextInput
            label="Procurar dispositivo"
            placeholder="Procurar dispositivos por nome ou ID"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />

          <Select
            label="Filtrar por localidade"
            placeholder="Todos os blocos"
            leftSection={<IconMapPin size={16} />}
            data={locations.map(loc => ({ value: loc as string, label: loc as string }))}
            value={locationFilter}
            onChange={setLocationFilter}
            clearable
            style={{ minWidth: '200px' }}
          />
        </Group>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton height={180} radius="md" mb="xl" />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <>


          {/* Device grid */}
          {filteredDevices.length > 0 ? (
            <Grid>
              {filteredDevices.map((device) => (
                <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={device.device_id}>
                  <DeviceCard device={device} />
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Paper>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}

export default DeviceListPage;
