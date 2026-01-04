import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  LoadingOverlay,
  Modal,
  Stack,
  Grid
} from '@mantine/core';
import { DatePickerInput, type DateStringValue } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import type {
  AlarmStatus, 
  AlarmSeverity, 
  AlarmQueryParams,
  AlarmCreateRequest,
  AlarmListResponse
} from '../../../types/alarms';
import type { MachineListResponse } from '../../../types/machines';
import machinesApi from "../../../services/api/machines.api.ts";
import alarmsApi from "../../../services/api/alarms.api.ts";
import dayjs from 'dayjs';

// Status badge colors
const statusColors = {
  open: 'red',
  ack: 'yellow',
  closed: 'green'
};

// Severity badge colors
const severityColors = {
  info: 'blue',
  warn: 'yellow',
  crit: 'red'
};

export function AlarmsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [machineId, setMachineId] = useState('');
  const [status, setStatus] = useState<AlarmStatus | ''>('');
  const [severity, setSeverity] = useState<AlarmSeverity | ''>('');
  const [fromDate, setFromDate] = useState<DateStringValue | null>(null);
  const [toDate, setToDate] = useState<DateStringValue | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<AlarmCreateRequest>>({
    type: 'manual',
    severity: 'warn',
    title: '',
    details: {
      metric: '',
      value: 0,
      limit: 0,
      unit: ''
    }
  });
  
  const limit = 10;

  // Build query params
  const queryParams: AlarmQueryParams = {
    limit,
    machineId: machineId || undefined,
    status: status || undefined,
    severity: severity || undefined,
    // Conversão explícita das datas string para ISO mantendo semântica existente
    from: fromDate ? dayjs(fromDate).toISOString() : undefined,
    to: toDate ? dayjs(toDate).toISOString() : undefined
  };

  // Fetch alarms
  const { data: alarmsData, isLoading: isLoadingAlarms } = useQuery<AlarmListResponse>({
    queryKey: ['alarms', queryParams],
    queryFn: () => alarmsApi.getAlarms(queryParams)
  });

  // Fetch machines for filter
  const { data: machinesData } = useQuery<MachineListResponse>({
    queryKey: ['machines'],
    queryFn: () => machinesApi.getMachines({ limit: 100 })
  });

  // Create alarm mutation
  const createAlarmMutation = useMutation({
    mutationFn: (data: AlarmCreateRequest) => alarmsApi.createAlarm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      setCreateModalOpen(false);
      notifications.show({
        title: 'Sucesso',
        message: 'Alarme criado com sucesso',
        color: 'green'
      });
      // Reset form
      setCreateForm({
        type: 'manual',
        severity: 'warn',
        title: '',
        details: {
          metric: '',
          value: 0,
          limit: 0,
          unit: ''
        }
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao criar alarme',
        color: 'red'
      });
      console.error('Create alarm error:', error);
    }
  });

  // Acknowledge alarm mutation
  const acknowledgeAlarmMutation = useMutation({
    mutationFn: (id: string) => alarmsApi.acknowledgeAlarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      notifications.show({
        title: 'Sucesso',
        message: 'Alarme reconhecido com sucesso',
        color: 'green'
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao reconhecer alarme',
        color: 'red'
      });
      console.error('Acknowledge alarm error:', error);
    }
  });

  // Close alarm mutation
  const closeAlarmMutation = useMutation({
    mutationFn: (id: string) => alarmsApi.closeAlarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      notifications.show({
        title: 'Sucesso',
        message: 'Alarme fechado com sucesso',
        color: 'green'
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao fechar alarme',
        color: 'red'
      });
      console.error('Close alarm error:', error);
    }
  });

  // Handle view alarm details
  const handleViewAlarm = (id: string) => {
    navigate(`/app/alarms/${id}`);
  };

  // Handle acknowledge alarm
  const handleAcknowledgeAlarm = (id: string) => {
    acknowledgeAlarmMutation.mutate(id);
  };

  // Handle close alarm
  const handleCloseAlarm = (id: string) => {
    closeAlarmMutation.mutate(id);
  };

  // Handle create alarm
  const handleCreateAlarm = () => {
    if (!createForm.machineId || !createForm.title) {
      notifications.show({
        title: 'Erro',
        message: 'Preencha todos os campos obrigatórios',
        color: 'red'
      });
      return;
    }
    
    createAlarmMutation.mutate(createForm as AlarmCreateRequest);
  };

  // Calculate total pages
  const totalPages = alarmsData?.meta?.total 
    ? Math.ceil(alarmsData.meta.total / limit) 
    : 1;
  // Defaults seguros para evitar acesso a arrays indefinidos
  const alarms = alarmsData?.data ?? [];
  const machines = machinesData?.data ?? [];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Alarmes</Title>
        <Button onClick={() => setCreateModalOpen(true)}>
          Criar Alarme Manual
        </Button>
      </Group>

      {/* Filters */}
      <Card withBorder mb="md" p="md">
        <Grid>
          <Grid.Col span={4}>
            <Select
              label="Máquina"
              placeholder="Todas"
              data={[
                { value: '', label: 'Todas' },
                ...machines.map(machine => ({
                  value: machine.id,
                  label: `${machine.machineKey} - ${machine.manufacturer} ${machine.model}`
                }))
              ]}
              value={machineId}
              onChange={(value) => setMachineId(value ?? '')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Status"
              placeholder="Todos"
              data={[
                { value: '', label: 'Todos' },
                { value: 'open', label: 'Aberto' },
                { value: 'ack', label: 'Reconhecido' },
                { value: 'closed', label: 'Fechado' }
              ]}
              value={status}
              onChange={(value) => setStatus(value as AlarmStatus | '')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Severidade"
              placeholder="Todas"
              data={[
                { value: '', label: 'Todas' },
                { value: 'info', label: 'Informação' },
                { value: 'warn', label: 'Alerta' },
                { value: 'crit', label: 'Crítico' }
              ]}
              value={severity}
              onChange={(value) => setSeverity(value as AlarmSeverity | '')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <DatePickerInput
              label="De"
              placeholder="Data inicial"
              value={fromDate}
              onChange={(value) => setFromDate(value)}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <DatePickerInput
              label="Até"
              placeholder="Data final"
              value={toDate}
              onChange={(value) => setToDate(value)}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button 
              onClick={() => {
                setMachineId('');
                setStatus('');
                setSeverity('');
                setFromDate(null);
                setToDate(null);
              }}
              fullWidth
            >
              Limpar Filtros
            </Button>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Alarms table */}
      <Card withBorder p={0} pos="relative">
        <LoadingOverlay visible={isLoadingAlarms} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Título</Table.Th>
              <Table.Th>Máquina</Table.Th>
              <Table.Th>Severidade</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Aberto em</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {alarms.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="md">Nenhum alarme encontrado</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {alarms.map((alarm) => (
              <Table.Tr key={alarm.id}>
                <Table.Td>{alarm.title}</Table.Td>
                <Table.Td>{alarm.machineId}</Table.Td>
                <Table.Td>
                  <Badge color={severityColors[alarm.severity]}>
                    {alarm.severity === 'info' && 'Informação'}
                    {alarm.severity === 'warn' && 'Alerta'}
                    {alarm.severity === 'crit' && 'Crítico'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={statusColors[alarm.status]}>
                    {alarm.status === 'open' && 'Aberto'}
                    {alarm.status === 'ack' && 'Reconhecido'}
                    {alarm.status === 'closed' && 'Fechado'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(alarm.openedAt).toLocaleString()}
                </Table.Td>
                <Table.Td>
                  <Group>
                    <Button 
                      variant="light" 
                      size="xs"
                      onClick={() => handleViewAlarm(alarm.id)}
                    >
                      Ver
                    </Button>
                    {alarm.status === 'open' && (
                      <Button 
                        variant="light" 
                        color="yellow"
                        size="xs"
                        onClick={() => handleAcknowledgeAlarm(alarm.id)}
                      >
                        Reconhecer
                      </Button>
                    )}
                    {(alarm.status === 'open' || alarm.status === 'ack') && (
                      <Button 
                        variant="light" 
                        color="green"
                        size="xs"
                        onClick={() => handleCloseAlarm(alarm.id)}
                      >
                        Fechar
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Pagination */}
      {alarms.length > 0 && (
        <Group justify="center" mt="md">
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={setPage} 
          />
        </Group>
      )}

      {/* Create Alarm Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Alarme Manual"
        size="lg"
      >
        <Stack>
          <Select
            label="Máquina"
            placeholder="Selecione a máquina"
            data={machines.map(machine => ({
              value: machine.id,
              label: `${machine.machineKey} - ${machine.manufacturer} ${machine.model}`
            }))}
            value={createForm.machineId}
            onChange={(value) => setCreateForm({
              ...createForm,
              machineId: value || ''
            })}
            required
          />
          <Select
            label="Severidade"
            placeholder="Selecione a severidade"
            data={[
              { value: 'info', label: 'Informação' },
              { value: 'warn', label: 'Alerta' },
              { value: 'crit', label: 'Crítico' }
            ]}
            value={createForm.severity}
            onChange={(value) => setCreateForm({
              ...createForm,
              severity: value as AlarmSeverity
            })}
            required
          />
          <TextInput
            label="Título"
            placeholder="Título do alarme"
            value={createForm.title}
            onChange={(e) => setCreateForm({
              ...createForm,
              title: e.target.value
            })}
            required
          />
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Métrica"
                placeholder="Ex: temperatura"
                value={createForm.details?.metric}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  details: {
                    ...createForm.details,
                    metric: e.target.value
                  }
                })}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Unidade"
                placeholder="Ex: C"
                value={createForm.details?.unit}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  details: {
                    ...createForm.details,
                    unit: e.target.value
                  }
                })}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Valor"
                placeholder="Valor atual"
                type="number"
                value={createForm.details?.value?.toString()}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  details: {
                    ...createForm.details,
                    value: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Limite"
                placeholder="Valor limite"
                type="number"
                value={createForm.details?.limit?.toString()}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  details: {
                    ...createForm.details,
                    limit: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </Grid.Col>
          </Grid>
          <TextInput
            label="Chave de Deduplicação (opcional)"
            placeholder="Identificador único para evitar duplicação"
            value={createForm.dedupeKey}
            onChange={(e) => setCreateForm({
              ...createForm,
              dedupeKey: e.target.value
            })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAlarm}
              loading={createAlarmMutation.isPending}
            >
              Criar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
