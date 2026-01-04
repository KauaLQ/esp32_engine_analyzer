import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Modal,
  Stack,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { PatioCreateRequest, PatioListResponse, PatioQueryParams } from '../../../types/patios';
import patiosApi from "../../../services/api/patios.api.ts";

export function PatiosListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<PatioCreateRequest>({
    name: '',
    address: ''
  });
  
  const limit = 10;

  // Build query params
  const queryParams: PatioQueryParams = {
    limit,
    search: search || undefined,
    order: 'desc'
  };

  // Fetch patios
  const { data: patiosData, isLoading: isLoadingPatios } = useQuery<PatioListResponse>({
    queryKey: ['patios', queryParams],
    queryFn: () => patiosApi.getPatios(queryParams)
  });

  // Create patio mutation
  const createPatioMutation = useMutation({
    mutationFn: (data: PatioCreateRequest) => patiosApi.createPatio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patios'] });
      setCreateModalOpen(false);
      notifications.show({
        title: 'Sucesso',
        message: 'Pátio criado com sucesso',
        color: 'green'
      });
      // Reset form
      setCreateForm({
        name: '',
        address: ''
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Erro',
        message: 'Falha ao criar pátio',
        color: 'red'
      });
      console.error('Create patio error:', error);
    }
  });

  // Delete patio mutation
  const deletePatioMutation = useMutation({
    mutationFn: (id: string) => patiosApi.deletePatio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patios'] });
      notifications.show({
        title: 'Sucesso',
        message: 'Pátio excluído com sucesso',
        color: 'green'
      });
    },
    onError: (error: unknown) => {
      // Check for 409 error (Cannot delete patio with machines assigned to it)
      const status = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
      if (status === 409) {
        notifications.show({
          title: 'Erro',
          message: 'Não é possível excluir um pátio com máquinas associadas',
          color: 'red'
        });
      } else {
        notifications.show({
          title: 'Erro',
          message: 'Falha ao excluir pátio',
          color: 'red'
        });
      }
      console.error('Delete patio error:', error);
    }
  });

  // Handle view patio details
  const handleViewPatio = (id: string) => {
    navigate(`/app/patios/${id}`);
  };

  // Handle view patio machines
  const handleViewPatioMachines = (id: string) => {
    navigate(`/app/patios/${id}/machines`);
  };

  // Handle delete patio
  const handleDeletePatio = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pátio?')) {
      deletePatioMutation.mutate(id);
    }
  };

  // Handle create patio
  const handleCreatePatio = () => {
    if (!createForm.name || !createForm.address) {
      notifications.show({
        title: 'Erro',
        message: 'Preencha todos os campos obrigatórios',
        color: 'red'
      });
      return;
    }
    
    createPatioMutation.mutate(createForm);
  };

  // Calculate total pages
  const totalPages = patiosData?.meta?.total 
    ? Math.ceil(patiosData.meta.total / limit) 
    : 1;
  // Garante um array definido para iterações e verificações
  const patios = patiosData?.data ?? [];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Pátios</Title>
        <Button onClick={() => setCreateModalOpen(true)}>
          Criar Pátio
        </Button>
      </Group>

      {/* Filters */}
      <Card withBorder mb="md" p="md">
        <Group>
          <TextInput
            label="Buscar"
            placeholder="Nome ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <Button 
            onClick={() => setSearch('')}
            style={{ marginTop: 'auto' }}
          >
            Limpar
          </Button>
        </Group>
      </Card>

      {/* Patios table */}
      <Card withBorder p={0} pos="relative">
        <LoadingOverlay visible={isLoadingPatios} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Endereço</Table.Th>
              <Table.Th>Criado em</Table.Th>
              <Table.Th>Atualizado em</Table.Th>
              <Table.Th>Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {patios.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" py="md">Nenhum pátio encontrado</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {patios.map((patio) => (
              <Table.Tr key={patio.id}>
                <Table.Td>{patio.name}</Table.Td>
                <Table.Td>{patio.address}</Table.Td>
                <Table.Td>{new Date(patio.createdAt).toLocaleString()}</Table.Td>
                <Table.Td>{new Date(patio.updatedAt).toLocaleString()}</Table.Td>
                <Table.Td>
                  <Group>
                    <Button 
                      variant="light" 
                      size="xs"
                      onClick={() => handleViewPatio(patio.id)}
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="light" 
                      size="xs"
                      onClick={() => handleViewPatioMachines(patio.id)}
                    >
                      Máquinas
                    </Button>
                    <Button 
                      variant="light" 
                      color="red"
                      size="xs"
                      onClick={() => handleDeletePatio(patio.id)}
                    >
                      Excluir
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Pagination */}
      {patios.length > 0 && (
        <Group justify="center" mt="md">
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={setPage} 
          />
        </Group>
      )}

      {/* Create Patio Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Pátio"
        size="md"
      >
        <Stack>
          <TextInput
            label="Nome"
            placeholder="Nome do pátio"
            value={createForm.name}
            onChange={(e) => setCreateForm({
              ...createForm,
              name: e.target.value
            })}
            required
          />
          <TextInput
            label="Endereço"
            placeholder="Endereço do pátio"
            value={createForm.address}
            onChange={(e) => setCreateForm({
              ...createForm,
              address: e.target.value
            })}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreatePatio}
              loading={createPatioMutation.isPending}
            >
              Criar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
