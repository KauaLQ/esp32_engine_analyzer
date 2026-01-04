import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Container, 
  Title, 
  Group, 
  TextInput, 
  Select, 
  Table, 
  Button, 
  Badge, 
  Card, 
  Text,
  Pagination,
  LoadingOverlay
} from '@mantine/core';
import type { MachineListResponse, MachineQueryParams, MachineStatus } from '../../../types/machines';
import type { PatioBase } from '../../../types/patios';
import patiosApi from "../../../services/api/patios.api.ts";

// Status badge colors
const statusColors = {
  operante: 'green',
  inoperante: 'red',
  manutencao: 'yellow'
};

export function PatioMachinesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MachineStatus | ''>('');
  const limit = 10;

  // Fetch patio details
  const { 
    data: patio, 
    isLoading: isLoadingPatio,
    error: patioError
  } = useQuery<PatioBase>({
    queryKey: ['patio', id],
    queryFn: () => id ? patiosApi.getPatio(id) : Promise.reject('No patio ID'),
    enabled: !!id
  });

  // Build query params
  const queryParams: MachineQueryParams = {
    limit,
    search: search || undefined,
    status: status || undefined,
    order: 'desc',
    orderBy: 'updatedAt'
  };

  // Fetch patio machines
  const { 
    data: machinesData, 
    isLoading: isLoadingMachines 
  } = useQuery<MachineListResponse>({
    queryKey: ['patio', id, 'machines', queryParams],
    queryFn: () => id ? patiosApi.getPatioMachines(id, queryParams) : Promise.reject('No patio ID'),
    enabled: !!id
  });

  // Handle view machine details
  const handleViewMachine = (machineId: string) => {
    navigate(`/app/machines/${machineId}`);
  };

  // Calculate total pages
  const totalPages = machinesData?.meta?.total 
    ? Math.ceil(machinesData.meta.total / limit) 
    : 1;
  // Garante arrays definidos antes de iterar
  const machines = machinesData?.data ?? [];

  // If error or no patio found
  if (patioError) {
    return (
      <Container size="xl">
        <Card withBorder p="xl" mt="md">
          <Text c="red" ta="center">Erro ao carregar detalhes do pátio</Text>
          <Group justify="center" mt="md">
            <Button onClick={() => navigate('/app/patios')}>
              Voltar para lista de pátios
            </Button>
          </Group>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>
          Máquinas do Pátio {patio?.name}
        </Title>
        <Group>
          <Button variant="light" onClick={() => navigate(`/app/patios/${id}`)}>
            Detalhes do Pátio
          </Button>
          <Button variant="light" onClick={() => navigate('/app/patios')}>
            Lista de Pátios
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card withBorder mb="md" p="md">
        <Group align="flex-end">
          <TextInput
            label="Buscar"
            placeholder="Nome, tag, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Status"
            placeholder="Todos"
            data={[
              { value: '', label: 'Todos' },
              { value: 'operante', label: 'Operante' },
              { value: 'inoperante', label: 'Inoperante' },
              { value: 'manutencao', label: 'Em Manutenção' }
            ]}
            value={status}
            onChange={(value) => setStatus(value as MachineStatus | '')}
          />
          <Button onClick={() => {
            setSearch('');
            setStatus('');
          }}>
            Limpar Filtros
          </Button>
        </Group>
      </Card>

      {/* Machines table */}
      <Card withBorder p={0} pos="relative">
        <LoadingOverlay visible={isLoadingMachines || isLoadingPatio} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Chave</Table.Th>
              <Table.Th>Fabricante</Table.Th>
              <Table.Th>Modelo</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Última Atualização</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {machines.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="md">Nenhuma máquina encontrada neste pátio</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {machines.map((machine) => (
              <Table.Tr key={machine.id}>
                <Table.Td>{machine.machineKey}</Table.Td>
                <Table.Td>{machine.manufacturer}</Table.Td>
                <Table.Td>{machine.model}</Table.Td>
                <Table.Td>
                  <Badge color={statusColors[machine.status]}>
                    {machine.status === 'operante' && 'Operante'}
                    {machine.status === 'inoperante' && 'Inoperante'}
                    {machine.status === 'manutencao' && 'Em Manutenção'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(machine.updatedAt).toLocaleString()}
                </Table.Td>
                <Table.Td>
                  <Button 
                    variant="light" 
                    size="xs"
                    onClick={() => handleViewMachine(machine.id)}
                  >
                    Ver
                  </Button>
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
