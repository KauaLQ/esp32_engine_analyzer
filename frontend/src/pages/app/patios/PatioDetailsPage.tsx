import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Container, 
  Title, 
  Group, 
  Button, 
  Card, 
  Text,
  LoadingOverlay,
  Stack,
  Modal,
  TextInput
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { PatioBase, PatioUpdateRequest } from '../../../types/patios';
import patiosApi from "../../../services/api/patios.api.ts";

export function PatioDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<PatioUpdateRequest>({
    name: '',
    address: ''
  });

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

  useEffect(() => {
    if (patio) {
      // Sincroniza formulário com o retorno da query usando efeito compatível com React Query v5
      setEditForm({
        name: patio.name,
        address: patio.address
      });
    }
  }, [patio]);

  // Update patio mutation
  const updatePatioMutation = useMutation({
    mutationFn: (data: PatioUpdateRequest) => {
      if (!id) return Promise.reject('No patio ID');
      return patiosApi.updatePatio(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patio', id] });
      setEditModalOpen(false);
      notifications.show({
        title: 'Sucesso',
        message: 'Pátio atualizado com sucesso',
        color: 'green'
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao atualizar pátio',
        color: 'red'
      });
      console.error('Update patio error:', error);
    }
  });

  // Handle edit form submit
  const handleEditSubmit = () => {
    if (!editForm.name && !editForm.address) {
      notifications.show({
        title: 'Erro',
        message: 'Preencha pelo menos um campo para atualizar',
        color: 'red'
      });
      return;
    }
    
    updatePatioMutation.mutate(editForm);
  };


  // If error or no patio found
  if (patioError) {
    return (
      <Container size="xl">
        <Card withBorder p="xl" mt="md">
          <Text c="red" ta="center">Erro ao carregar detalhes do pátio</Text>
          <Group justify="center" mt="md">
            <Button onClick={() => navigate('/app/patios')}>
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
          Detalhes do Pátio {patio?.name}
        </Title>
        <Group>
          <Button variant="light" onClick={() => navigate('/app/patios')}>
            Voltar para lista
          </Button>
          <Button onClick={() => setEditModalOpen(true)}>
            Editar
          </Button>
        </Group>
      </Group>

      <Card withBorder p="md" pos="relative">
        <LoadingOverlay visible={isLoadingPatio} />

        {/*

                  {patio && (
          <Stack spacing="md">
            <Group>
              <Text fw={500} w={150}>ID:</Text>
              <Text>{patio.id}</Text>
            </Group>
            <Group>
              <Text fw={500} w={150}>Nome:</Text>
              <Text>{patio.name}</Text>
            </Group>
            <Group>
              <Text fw={500} w={150}>Endereço:</Text>
              <Text>{patio.address}</Text>
            </Group>
            <Group>
              <Text fw={500} w={150}>Criado em:</Text>
              <Text>{new Date(patio.createdAt).toLocaleString()}</Text>
            </Group>
            <Group>
              <Text fw={500} w={150}>Atualizado em:</Text>
              <Text>{new Date(patio.updatedAt).toLocaleString()}</Text>
            </Group>

            <Button
              variant="light"
              onClick={handleViewPatioMachines}
              mt="md"
            >
              Ver Máquinas deste Pátio
            </Button>
          </Stack>
        )}


        */}

      </Card>

      {/* Edit Patio Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Pátio"
        size="md"
      >
        <Stack>
          <TextInput
            label="Nome"
            placeholder="Nome do pátio"
            value={editForm.name}
            onChange={(e) => setEditForm({
              ...editForm,
              name: e.target.value
            })}
          />
          <TextInput
            label="Endereço"
            placeholder="Endereço do pátio"
            value={editForm.address}
            onChange={(e) => setEditForm({
              ...editForm,
              address: e.target.value
            })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSubmit}
              loading={updatePatioMutation.isPending}
            >
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
