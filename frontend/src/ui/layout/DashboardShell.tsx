import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  Title,
  Badge,
  Menu,
  ActionIcon,
  Text,
  Avatar,
  Divider,
  rem,
  ScrollArea, Image
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import { useAuthStore } from '../../lib/auth/authStore';
import { Sidebar } from './Sidebar';
import type {ReactNode} from "react";
import logo from './../assets/logo.svg';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'red' : 'orange';
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 300, 
        breakpoint: 'sm', 
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Image src={logo} w={'32px'} h={'32px'} />
            <Title order={3} c="orange">Rotorial</Title>
          </Group>

          <Group>
            {user && (
              <>
                <Badge color={getRoleBadgeColor(user.role)} variant="filled" size="md">
                  {user.role === 'admin' ? 'Admin' : 'Operator'}
                </Badge>

                <Menu position="bottom-end" withArrow shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" radius="xl" size="lg">
                      <Avatar color="orange" radius="xl" size="sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>
                      <Text fw={500}>{user.fullName}</Text>
                      <Text size="xs" c="dimmed">{user.email}</Text>
                    </Menu.Label>

                    <Divider />

                    <Menu.Item 
                      leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                      onClick={() => navigate('/app/settings/profile')}
                    >
                      Profile
                    </Menu.Item>

                    {user.role === 'admin' && (
                      <Menu.Item 
                        leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                        onClick={() => navigate('/app/settings/users')}
                      >
                        User Management
                      </Menu.Item>
                    )}

                    <Divider />

                    <Menu.Item 
                      leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                      onClick={handleLogout}
                      color="red"
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          <Sidebar />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default DashboardShell;
