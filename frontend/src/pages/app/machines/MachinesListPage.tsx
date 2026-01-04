import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Container, 
  Title, 
  Group, 
  TextInput, 
  Table, 
  Button, 
  Card, 
  Text,
  Pagination,
  LoadingOverlay,
  Stack,
  Select,
} from '@mantine/core';
import type { MachineListResponse, MachineQueryParams, MachineStatus } from '../../../types/machines';
import type { PatioListResponse } from '../../../types/patios';
import machinesApi from "../../../services/api/machines.api.ts";
import patiosApi from "../../../services/api/patios.api.ts";

export function MachinesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [status, setStatus] = useState<MachineStatus | ''>(() => 
    searchParams.get('status') as MachineStatus || ''
  );
  const [patioId, setPatioId] = useState<string>(() => searchParams.get('patioId') || '');

  const limit = 10;

  // Build query params for machines API
  const machineQueryParams: MachineQueryParams = {
    limit,
    search: search || undefined,
    status: status || undefined,
    patioId: patioId || undefined,
    order: 'desc'
  };

  // Fetch machines
  const { data: machinesData, isLoading: isLoadingMachines } = useQuery<MachineListResponse>({
    queryKey: ['machines', machineQueryParams],
    queryFn: () => machinesApi.getMachines(machineQueryParams),
  });

  // Fetch patios for filter dropdown
  const { data: patiosData } = useQuery<PatioListResponse>({
    queryKey: ['patios-list'],
    queryFn: () => patiosApi.getPatios({ limit: 100 }),
  });

  // Handle view machine details
  const handleViewMachine = (id: string) => {
    navigate(`/app/machines/${id}`);
  };

  // Update URL params when filters change
  const updateUrlParams = () => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', page.toString());
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (patioId) params.set('patioId', patioId);

    setSearchParams(params);
  };

  // Update URL when filters change
  React.useEffect(() => {
    updateUrlParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, patioId]);

  // Handle filter reset
  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPatioId('');
    setPage(1);
  };

  // Calculate total pages
  const totalPages = machinesData?.meta?.total 
    ? Math.ceil(machinesData.meta.total / limit) 
    : 1;
  // Defaults seguros para evitar acesso a arrays indefinidos
  const machines = machinesData?.data ?? [];
  const patios = patiosData?.data ?? [];

  // Status options for dropdown
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'operante', label: 'Operante' },
    { value: 'inoperante', label: 'Inoperante' },
    { value: 'manutencao', label: 'Manutenção' }
  ];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Máquinas</Title>
      </Group>

      {/* Filters */}
      <Card withBorder mb="md" p="md">
        <Stack>
          <Group>
            <TextInput
              label="Buscar"
              placeholder="Fabricante, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <Select
              label="Status"
              placeholder="Selecione o status"
              data={statusOptions}
              value={status}
              onChange={(value) => setStatus(value as MachineStatus | '')}
              clearable
              style={{ minWidth: '200px' }}
            />
            <Select
              label="Pátio"
              placeholder="Selecione o pátio"
              data={patios.map((patio) => ({ value: patio.id, label: patio.name }))}
              value={patioId}
              onChange={(value) => setPatioId(value || '')}
              clearable
              style={{ minWidth: '200px' }}
            />
          </Group>
          <Group justify="flex-end">
            <Button onClick={handleResetFilters}>
              Limpar Filtros
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Machines table */}
      <Card withBorder p={0} pos="relative">
        <LoadingOverlay visible={isLoadingMachines} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Fabricante</Table.Th>
              <Table.Th>Modelo</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Última Atividade</Table.Th>
              <Table.Th>Criado em</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {machines.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" py="md">Nenhuma máquina encontrada</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {machines.map((machine) => (
              <Table.Tr key={machine.id}>
                <Table.Td>{machine.machineKey}</Table.Td>
                <Table.Td>{machine.manufacturer}</Table.Td>
                <Table.Td>{machine.model}</Table.Td>
                <Table.Td>
                  <Text
                    c={
                      machine.status === 'operante' 
                        ? 'green' 
                        : machine.status === 'inoperante' 
                          ? 'red' 
                          : 'orange'
                    }
                    fw={500}
                  >
                    {machine.status === 'operante' 
                      ? 'Operante' 
                      : machine.status === 'inoperante' 
                        ? 'Inoperante' 
                        : 'Manutenção'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {machine.lastSeenAt 
                    ? new Date(machine.lastSeenAt).toLocaleString() 
                    : '—'}
                </Table.Td>
                <Table.Td>{new Date(machine.createdAt).toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group>
                    <Button 
                      variant="light" 
                      size="xs"
                      onClick={() => handleViewMachine(machine.id)}
                    >
                      Ver Detalhes
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Pagination */}
      {machines.length > 0 && (
        <Group justify="center" mt="md">
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={setPage} 
          />
        </Group>
      )}
    </Container>
  );
}

export default MachinesListPage;
