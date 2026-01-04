import { NavLink, Stack, Text } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconDashboard,
  IconSettings,
  IconUsers,
  IconGauge,
  IconBell,
  IconBuilding,
} from '@tabler/icons-react';
import { useAuthStore } from '../../lib/auth/authStore';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  // Itens de navegação
  const navItems = [
    {
      label: 'Dashboard',
      icon: <IconDashboard size={20} stroke={1.5} />,
      path: '/app/dashboard',
      active: location.pathname === '/app/dashboard',
    },
    {
      label: 'Máquinas',
      icon: <IconGauge size={20} stroke={1.5} />,
      path: '/app/machines',
      active: location.pathname.startsWith('/app/machines'),
    },
    {
      label: 'Alarmes',
      icon: <IconBell size={20} stroke={1.5} />,
      path: '/app/alarms',
      active: location.pathname.startsWith('/app/alarms'),
    },
    {
      label: 'Pátios',
      icon: <IconBuilding size={20} stroke={1.5} />,
      path: '/app/patios',
      active: location.pathname.startsWith('/app/patios'),
    },
  ];

  // Itens de configurações
  const settingsItems = [
    {
      label: 'Perfil',
      icon: <IconSettings size={20} stroke={1.5} />,
      path: '/app/settings/profile',
      active: location.pathname === '/app/settings/profile',
    },
    // Exibe o gerenciamento de usuários apenas para admin
    ...(isAdmin
        ? [
          {
            label: 'Usuários',
            icon: <IconUsers size={20} stroke={1.5} />,
            path: '/app/settings/users',
            active: location.pathname === '/app/settings/users',
          },
        ]
        : []),
  ];

  return (
      <Stack gap="xs">
        <Text size="sm" fw={500} c="dimmed" mb="xs">
          Principal
        </Text>

        {navItems.map((item) => (
            <NavLink
                key={item.path}
                label={item.label}
                leftSection={item.icon}
                active={item.active}
                onClick={() => navigate(item.path)}
            />
        ))}

        <Text size="sm" fw={500} c="dimmed" mt="md" mb="xs">
          Configurações
        </Text>

        {settingsItems.map((item) => (
            <NavLink
                key={item.path}
                label={item.label}
                leftSection={item.icon}
                active={item.active}
                onClick={() => navigate(item.path)}
            />
        ))}
      </Stack>
  );
}

export default Sidebar;
