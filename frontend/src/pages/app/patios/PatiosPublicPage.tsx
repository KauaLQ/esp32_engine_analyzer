import { useQuery } from '@tanstack/react-query';
import { 
  Container, 
  Title, 
  Card, 
  Text,
  SimpleGrid,
  LoadingOverlay,
  Stack,
} from '@mantine/core';
import patiosApi from "../../../services/api/patios.api.ts";

export function PatiosPublicPage() {
  // Fetch public patios
  const { data: patios, isLoading } = useQuery({
    queryKey: ['patios', 'public'],
    queryFn: () => patiosApi.getPublicPatios()
  });

  return (
    <Container size="xl">
      <Title order={2} mb="md">Pátios Públicos</Title>
      
      <Card withBorder p="md" pos="relative">
        <LoadingOverlay visible={isLoading} />
        
        {patios && patios.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {patios.map((patio) => (
              <Card key={patio.patioId} withBorder shadow="sm">
                <Stack>
                  <Title order={4}>{patio.name}</Title>
                  <Text>{patio.address}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            {isLoading ? 'Carregando pátios...' : 'Nenhum pátio público encontrado'}
          </Text>
        )}
      </Card>
    </Container>
  );
}
