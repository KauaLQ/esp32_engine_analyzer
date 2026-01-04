import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Card,
  Container,
  Stack,
  Alert,
  Center, Image,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuthStore } from '../../lib/auth/authStore';

import logo from './../../ui/assets/logo.svg';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: zodResolver(loginSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async () => {
    setError(null);

    // ✅ valida antes de chamar API
    const validation = form.validate();
    if (validation.hasErrors) return;

    const { email, password } = form.values;

    setLoading(true);
    try {
      await login(email, password);

      notifications.show({
        title: 'Login successful',
        message: 'Welcome to Rotorial',
        color: 'green',
      });

      console.log('Logado com sucesso redirecionando');
      navigate('/app/dashboard');
    } catch (err: any) {
      if (err?.response) {
        if (err.response.status === 401) setError('Invalid credentials');
        else if (err.response.status === 403) setError('User account is disabled');
        else setError('An error occurred. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enter nos inputs dispara login (sem <form>)
  const onKeyDownSubmit: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
      <Container size="xs" py="xl">
        <Center mih="100vh">
          <Card withBorder shadow="md" p="xl" radius="md" w="100%">
            <Stack>

              <Stack w={'100%'} align={'center'}>
                <Image src={logo} w={'128px'} h={'128px'}/>
              </Stack>

              <Title order={2} c="orange" ta="center">
                Rotorial
              </Title>
              <Text c="dimmed" size="sm" ta="center" mb="lg">
                Digite suas credenciais para entrar no sistema.
              </Text>

              {error && (
                  <Alert
                      icon={<IconAlertCircle size={16} />}
                      title="Authentication Error"
                      color="red"
                      variant="filled"
                  >
                    {error}
                  </Alert>
              )}

              <Stack>
                <TextInput
                    label="Email"
                    placeholder="seu@email.com"
                    required
                    {...form.getInputProps('email')}
                    onKeyDown={onKeyDownSubmit}
                    autoComplete="email"
                />

                <PasswordInput
                    label="Password"
                    placeholder="Sua senha"
                    required
                    {...form.getInputProps('password')}
                    onKeyDown={onKeyDownSubmit}
                    autoComplete="current-password"
                />

                <Button fullWidth loading={loading} mt="md" onClick={() => void handleSubmit()}>
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Center>
      </Container>
  );
}

export default LoginPage;
