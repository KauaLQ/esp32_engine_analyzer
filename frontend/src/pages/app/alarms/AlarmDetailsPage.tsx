import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Container, 
  Title, 
  Group, 
  Button, 
  Badge, 
  Card, 
  Text,
  LoadingOverlay,
  Stack,
  Grid,
  Modal
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import alarmsApi from "../../../services/api/alarms.api.ts";
import machinesApi from "../../../services/api/machines.api.ts";

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

export function AlarmDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch alarm details
  const { 
    data: alarm, 
    isLoading: isLoadingAlarm,
    error: alarmError
  } = useQuery({
    queryKey: ['alarm', id],
    queryFn: () => id ? alarmsApi.getAlarm(id) : Promise.reject('No alarm ID'),
    enabled: !!id
  });

  // Fetch machine details if alarm has machineId
  const { data: machine } = useQuery({
    queryKey: ['machine', alarm?.machineId],
    queryFn: () => machinesApi.getMachine(alarm?.machineId || ''),
    enabled: !!alarm?.machineId
  });

  // Acknowledge alarm mutation
  const acknowledgeAlarmMutation = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject('No alarm ID');
      return alarmsApi.acknowledgeAlarm(id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['alarm', id], data);
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
    mutationFn: () => {
      if (!id) return Promise.reject('No alarm ID');
      return alarmsApi.closeAlarm(id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['alarm', id], data);
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

  // Delete alarm mutation
  const deleteAlarmMutation = useMutation({
    mutationFn: () => {
      if (!id) return Promise.reject('No alarm ID');
      return alarmsApi.deleteAlarm(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms'] });
      notifications.show({
        title: 'Sucesso',
        message: 'Alarme excluído com sucesso',
        color: 'green'
      });
      navigate('/app/alarms');
    },
    onError: (error) => {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao excluir alarme',
        color: 'red'
      });
      console.error('Delete alarm error:', error);
    }
  });

  // Handle acknowledge alarm
  const handleAcknowledgeAlarm = () => {
    acknowledgeAlarmMutation.mutate();
  };

  // Handle close alarm
  const handleCloseAlarm = () => {
    closeAlarmMutation.mutate();
  };

  // Handle delete alarm
  const handleDeleteAlarm = () => {
    deleteAlarmMutation.mutate();
  };

  // Format alarm details for display
  const formatDetails = (details: Record<string, any>) => {
    if (!details) return null;

    return (
      <Stack>
        {Object.entries(details).map(([key, value]) => (
          <Group key={key}>
            <Text fw={500}>{key}:</Text>
            <Text>
              {typeof value === 'object' 
                ? JSON.stringify(value) 
                : value.toString()}
            </Text>
          </Group>
        ))}
      </Stack>
    );
  };

  // If error or no alarm found
  if (alarmError) {
    return (
      <Container size="xl">
        <Card withBorder p="xl" mt="md">
          <Text c="red" ta="center">Erro ao carregar detalhes do alarme</Text>
          <Group justify="center" mt="md">
            <Button onClick={() => navigate('/app/alarms')}>
              Voltar para lista
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
          Detalhes do Alarme
        </Title>
        <Button variant="light" onClick={() => navigate('/app/alarms')}>
          Voltar para lista
        </Button>
      </Group>

      <Card withBorder p="md" pos="relative">
        <LoadingOverlay visible={isLoadingAlarm} />
        
        {alarm && (
          <>
            <Grid>
              <Grid.Col span={8}>
                <Stack>
                  <Group>
                    <Text fw={700} size="xl">{alarm.title}</Text>
                  </Group>
                  <Group>
                    <Badge color={severityColors[alarm.severity]} size="lg">
                      {alarm.severity === 'info' && 'Informação'}
                      {alarm.severity === 'warn' && 'Alerta'}
                      {alarm.severity === 'crit' && 'Crítico'}
                    </Badge>
                    <Badge color={statusColors[alarm.status]} size="lg">
                      {alarm.status === 'open' && 'Aberto'}
                      {alarm.status === 'ack' && 'Reconhecido'}
                      {alarm.status === 'closed' && 'Fechado'}
                    </Badge>
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={4}>
                <Group justify="flex-end">
                  {alarm.status === 'open' && (
                    <Button 
                      color="yellow"
                      onClick={handleAcknowledgeAlarm}
                      loading={acknowledgeAlarmMutation.isPending}
                    >
                      Reconhecer
                    </Button>
                  )}
                  {(alarm.status === 'open' || alarm.status === 'ack') && (
                    <Button 
                      color="green"
                      onClick={handleCloseAlarm}
                      loading={closeAlarmMutation.isPending}
                    >
                      Fechar
                    </Button>
                  )}
                  <Button 
                    color="red"
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Excluir
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>

            <Grid mt="xl">
              <Grid.Col span={6}>
                <Card withBorder>
                  <Title order={4} mb="md">Informações do Alarme</Title>
                  <Stack>
                    <Group>
                      <Text fw={500}>ID:</Text>
                      <Text>{alarm.id}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Tipo:</Text>
                      <Text>{alarm.type}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Aberto em:</Text>
                      <Text>{new Date(alarm.openedAt).toLocaleString()}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Última atualização:</Text>
                      <Text>{new Date(alarm.lastSeenAt).toLocaleString()}</Text>
                    </Group>
                    {alarm.ackAt && (
                      <Group>
                        <Text fw={500}>Reconhecido em:</Text>
                        <Text>{new Date(alarm.ackAt).toLocaleString()}</Text>
                      </Group>
                    )}
                    {alarm.closedAt && (
                      <Group>
                        <Text fw={500}>Fechado em:</Text>
                        <Text>{new Date(alarm.closedAt).toLocaleString()}</Text>
                      </Group>
                    )}
                    {alarm.dedupeKey && (
                      <Group>
                        <Text fw={500}>Chave de Deduplicação:</Text>
                        <Text>{alarm.dedupeKey}</Text>
                      </Group>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Title order={4} mb="md">Detalhes</Title>
                  {formatDetails(alarm.details)}
                </Card>
                
                {machine && (
                  <Card withBorder mt="md">
                    <Title order={4} mb="md">Máquina</Title>
                    <Stack>
                      <Group>
                        <Text fw={500}>ID:</Text>
                        <Text>{machine.id}</Text>
                      </Group>
                      <Group>
                        <Text fw={500}>Chave:</Text>
                        <Text>{machine.machineKey}</Text>
                      </Group>
                      <Group>
                        <Text fw={500}>Fabricante:</Text>
                        <Text>{machine.manufacturer}</Text>
                      </Group>
                      <Group>
                        <Text fw={500}>Modelo:</Text>
                        <Text>{machine.model}</Text>
                      </Group>
                      <Group>
                        <Text fw={500}>Status:</Text>
                        <Badge>
                          {machine.status === 'operante' && 'Operante'}
                          {machine.status === 'inoperante' && 'Inoperante'}
                          {machine.status === 'manutencao' && 'Em Manutenção'}
                        </Badge>
                      </Group>
                      <Button 
                        variant="light" 
                        onClick={() => navigate(`/app/machines/${machine.id}`)}
                      >
                        Ver Máquina
                      </Button>
                    </Stack>
                  </Card>
                )}
              </Grid.Col>
            </Grid>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        centered
      >
        <Text>Tem certeza que deseja excluir este alarme?</Text>
        <Text size="sm" c="dimmed" mt="xs">
          Esta ação não pode ser desfeita.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            color="red" 
            onClick={handleDeleteAlarm}
            loading={deleteAlarmMutation.isPending}
          >
            Excluir
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
