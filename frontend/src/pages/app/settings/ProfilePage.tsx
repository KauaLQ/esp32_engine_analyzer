import { useState } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Button, 
  Divider, 
  Badge,
  Container,
  SimpleGrid
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../lib/auth/authStore';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      notifications.show({
        title: 'Logged out',
        message: 'You have been successfully logged out',
        color: 'blue',
      });
      navigate('/login');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred during logout',
        color: 'red',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'red' : 'orange';
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'green' : 'gray';
  };

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Card withBorder p="xl">
          <Text>Loading user information...</Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md">Profile Settings</Title>
      
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder p="xl">
          <Stack>
            <Title order={3}>User Information</Title>
            <Divider />
            
            <Group justify="space-between">
              <Text fw={500}>Full Name</Text>
              <Text>{user.fullName}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Email</Text>
              <Text>{user.email}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Role</Text>
              <Badge color={getRoleBadgeColor(user.role)}>
                {user.role === 'admin' ? 'Administrator' : 'Operator'}
              </Badge>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>Status</Text>
              <Badge color={getStatusBadgeColor(user.status)}>
                {user.status}
              </Badge>
            </Group>
            
            <Group justify="space-between">
              <Text fw={500}>User ID</Text>
              <Text size="sm" c="dimmed">{user.id}</Text>
            </Group>
          </Stack>
        </Card>
        
        <Card withBorder p="xl">
          <Stack>
            <Title order={3}>Account Actions</Title>
            <Divider />
            
            <Text size="sm" c="dimmed">
              You can log out from all devices by clicking the button below.
              This will invalidate your current session and require you to log in again.
            </Text>
            
            <Button 
              leftSection={<IconLogout size={16} />}
              color="red" 
              variant="light"
              onClick={handleLogout}
              loading={isLoggingOut}
              mt="md"
            >
              Logout
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Container>
  );
}

export default ProfilePage;
