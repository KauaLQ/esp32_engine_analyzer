import { useState } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Button, 
  TextInput, 
  PasswordInput, 
  Select, 
  Container,
  Alert,
  Table,
  Badge,
  ScrollArea,
  Modal
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { IconAlertCircle, IconUserPlus } from '@tabler/icons-react';
import { useAuthStore } from '../../../lib/auth/authStore';
import type { UserRole } from '../../../types/auth';

// User registration form validation schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  role: z.enum(['admin', 'operator']),
});

// Form values type
type UserFormValues = z.infer<typeof userSchema>;

export function UsersAdminPage() {
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, registerUser } = useAuthStore();

  // Initialize form with validation
  const form = useForm<UserFormValues>({
    initialValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'operator',
    },
    validate: zodResolver(userSchema),
  });

  // Handle form submission
  const handleSubmit = async (values: UserFormValues) => {
    setError(null);
    setLoading(true);

    try {
      await registerUser(
        values.email, 
        values.password, 
        values.fullName, 
        values.role as UserRole
      );
      
      // Show success notification
      notifications.show({
        title: 'User created',
        message: `User ${values.fullName} has been created successfully`,
        color: 'green',
      });
      
      // Reset form and close modal
      form.reset();
      setOpened(false);
    } catch (error: any) {
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 409) {
          setError('Email already exists');
        } else if (error.response.status === 400) {
          setError('Invalid data provided');
        } else {
          setError('An error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'red' : 'orange';
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>User Management</Title>
        <Button 
          leftSection={<IconUserPlus size={16} />}
          onClick={() => setOpened(true)}
        >
          Create User
        </Button>
      </Group>

      <Card withBorder p="md">
        <Text mb="md">
          As an administrator, you can create new user accounts for the platform.
          New users will be able to log in with the credentials you provide.
        </Text>

        {/* This would typically show a list of users from an API */}
        {/* For this implementation, we'll just show the current admin user */}
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {user && (
                <Table.Tr>
                  <Table.Td>{user.fullName}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>
                    <Badge color={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="green">
                      {user.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              )}
              {/* In a real application, you would map through users from an API */}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Create User Modal */}
      <Modal 
        opened={opened} 
        onClose={() => {
          setOpened(false);
          setError(null);
          form.reset();
        }}
        title="Create New User"
        size="md"
      >
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            variant="filled"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              {...form.getInputProps('fullName')}
            />

            <TextInput
              label="Email"
              placeholder="user@rotorial.com"
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Minimum 8 characters"
              required
              {...form.getInputProps('password')}
            />

            <Select
              label="Role"
              placeholder="Select user role"
              data={[
                { value: 'operator', label: 'Operator' },
                { value: 'admin', label: 'Administrator' },
              ]}
              required
              {...form.getInputProps('role')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create User
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

export default UsersAdminPage;
