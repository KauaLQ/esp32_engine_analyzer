import { useState, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Group,
  ThemeIcon,
  Stack,
  Skeleton,
  Alert,
  Button,
  SegmentedControl,
  Box,
  Chip,
  Center,
  Paper,
} from '@mantine/core';
import { DatePickerInput, type DateStringValue, type DatesRangeValue } from '@mantine/dates';
import {
  IconGauge,
  IconBell,
  IconBuilding,
  IconMountain,
  IconTemperature,
  IconBolt,
  IconAlertCircle,
  IconCalendar,
  IconInfoCircle,
  IconCurrentLocation,
} from '@tabler/icons-react';
import { useAuthStore } from '../../lib/auth/authStore';
import { useDashboardMetrics } from '../../lib/hooks/useDashboardMetrics';
import dayjs from 'dayjs';

// Opções de período
const TIME_PERIODS = {
  '24h': { label: '24h', value: '24h' },
  '7d': { label: '7d', value: '7d' },
  '30d': { label: '30d', value: '30d' },
  custom: { label: 'Personalizado', value: 'custom' },
};

export function DashboardHome() {
  const { user } = useAuthStore();
  const [timePeriod, setTimePeriod] = useState<string>(TIME_PERIODS['30d'].value);
  // Tipagem explícita do intervalo de datas em strings (formato Mantine) para alinhar com o DatePickerInput
  const [customDateRange, setCustomDateRange] = useState<DatesRangeValue<DateStringValue>>([null, null]);

  // Calcula o intervalo de datas com base no período selecionado
  const dateRange = useMemo((): { from: string; to: string } => {
    const now = new Date();
    const to = dayjs(now).endOf('day').toISOString();

    let from: string;

    if (timePeriod === TIME_PERIODS['24h'].value) {
      from = dayjs(now).subtract(24, 'hour').startOf('hour').toISOString();
    } else if (timePeriod === TIME_PERIODS['7d'].value) {
      from = dayjs(now).subtract(7, 'day').startOf('day').toISOString();
    } else if (timePeriod === TIME_PERIODS['30d'].value) {
      from = dayjs(now).subtract(30, 'day').startOf('day').toISOString();
    } else if (
        timePeriod === TIME_PERIODS.custom.value &&
        customDateRange &&
        customDateRange[0] &&
        customDateRange[1]
    ) {
      from = dayjs(customDateRange[0]).startOf('day').toISOString();
      return { from, to: dayjs(customDateRange[1]).endOf('day').toISOString() };
    } else {
      // Padrão: 30 dias caso o personalizado esteja selecionado, mas sem datas escolhidas
      from = dayjs(now).subtract(30, 'day').startOf('day').toISOString();
    }

    return { from, to };
  }, [timePeriod, customDateRange]);

  // Busca métricas do dashboard
  const { data, isLoading, isError, refetch } = useDashboardMetrics(dateRange);

  // Formata números com as casas decimais especificadas
  const formatNumber = (value: number | null | undefined, decimalPlaces: number = 0): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(decimalPlaces);
  };

  // Verifica se todas as médias estão nulas
  const allAveragesNull = useMemo(() => {
    if (!data) return true;
    return (
        data.averages.avgTemperatureC === null &&
        data.averages.avgVoltageV === null &&
        data.averages.avgCurrentA === null &&
        data.averages.avgPowerKw === null &&
        data.averages.avgEnergyKwh === null &&
        data.averages.avgKgco2e === null
    );
  }, [data]);

  // Verifica se os dados estão vazios (zeros e nulos)
  const isDataEmpty = useMemo(() => {
    if (!data) return true;
    return (
        data.globalStats.machinesTotal === 0 &&
        data.globalStats.patiosTotal === 0 &&
        data.globalStats.alarms.byStatus.open === 0 &&
        allAveragesNull
    );
  }, [data, allAveragesNull]);

  // Lida com mudança de período
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    if (value !== TIME_PERIODS.custom.value) {
      setCustomDateRange([null, null]);
    }
  };

  if (isError) {
    return (
        <Container size="lg" py="xl">
          <Alert icon={<IconAlertCircle size="1rem" />} title="Erro" color="red.6" mb="md">
            Falha ao carregar métricas
          </Alert>
          <Button onClick={() => refetch()} color="red.6" variant="outline">
            Tentar novamente
          </Button>
        </Container>
    );
  }

  return (
      <Container size="lg" py="xl">
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2} mb="xs">
              Dashboard
            </Title>
            <Text size="lg">
              Bem vindo de volta, <strong>{user?.fullName}</strong>!
            </Text>
          </div>

          {/* Seletor de Período */}
          <Box>
            <SegmentedControl
                value={timePeriod}
                onChange={handleTimePeriodChange}
                data={Object.values(TIME_PERIODS)}
                mb="xs"
                color="orange.4"
            />

            {timePeriod === TIME_PERIODS.custom.value && (
                <DatePickerInput
                    type="range"
                    placeholder="Selecione um intervalo de datas"
                    value={customDateRange}
                    onChange={setCustomDateRange}
                    leftSection={<IconCalendar size="1rem" />}
                    clearable
                    maxDate={new Date()}
                />
            )}
          </Box>
        </Group>

        {isDataEmpty && !isLoading ? (
            <Center py="xl">
              <Paper p="xl" withBorder radius="md" w="100%" ta="center">
                <IconInfoCircle size={48} stroke={1.5} color="var(--mantine-color-orange-4)" />
                <Text size="lg" fw={500} mt="md">
                  Nenhum dado disponível
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Não há dados disponíveis para o período selecionado. Tente escolher outro intervalo de tempo.
                </Text>
              </Paper>
            </Center>
        ) : (
            <>
              {/* Cards de Estatísticas */}
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
                {/* Máquinas */}
                <Card withBorder p="md">
                  <Group>
                    <ThemeIcon color="orange.4" variant="light" size="lg" radius="md">
                      <IconGauge size={28} stroke={1.5} />
                    </ThemeIcon>

                    <div>
                      <Text size="xs" c="dimmed">
                        Máquinas
                      </Text>
                      {isLoading ? (
                          <Skeleton height={28} width={60} />
                      ) : (
                          <Text fw={700} size="xl">
                            {data?.globalStats.machinesTotal || 0}
                          </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        Total de máquinas monitoradas
                      </Text>
                    </div>
                  </Group>
                </Card>

                {/* Alarmes Ativos */}
                <Card withBorder p="md">
                  <Group>
                    <ThemeIcon color="orange.4" variant="light" size="lg" radius="md">
                      <IconBell size={28} stroke={1.5} />
                    </ThemeIcon>

                    <div>
                      <Text size="xs" c="dimmed">
                        Alarmes ativos
                      </Text>

                      {isLoading ? (
                          <Skeleton height={28} width={60} />
                      ) : (
                          <Text fw={700} size="xl">
                            {data?.globalStats.alarms.byStatus.open || 0}
                          </Text>
                      )}

                      {isLoading ? (
                          <Skeleton height={16} width={120} mt={4} />
                      ) : (
                          <Group gap={4}>
                            {data?.globalStats.alarms.openBySeverity.crit ? (
                                <Chip size="xs" variant="filled" color="red.6" checked={false}>
                                  {data.globalStats.alarms.openBySeverity.crit} crit
                                </Chip>
                            ) : null}
                            {data?.globalStats.alarms.openBySeverity.warn ? (
                                <Chip size="xs" variant="filled" color="yellow.6" checked={false}>
                                  {data.globalStats.alarms.openBySeverity.warn} warn
                                </Chip>
                            ) : null}
                            {data?.globalStats.alarms.openBySeverity.info ? (
                                <Chip size="xs" variant="filled" color="blue.6" checked={false}>
                                  {data.globalStats.alarms.openBySeverity.info} info
                                </Chip>
                            ) : null}
                          </Group>
                      )}
                    </div>
                  </Group>
                </Card>

                {/* Pátios */}
                <Card withBorder p="md">
                  <Group>
                    <ThemeIcon color="orange.4" variant="light" size="lg" radius="md">
                      <IconBuilding size={28} stroke={1.5} />
                    </ThemeIcon>

                    <div>
                      <Text size="xs" c="dimmed">
                        Patios
                      </Text>
                      {isLoading ? (
                          <Skeleton height={28} width={60} />
                      ) : (
                          <Text fw={700} size="xl">
                            {data?.globalStats.patiosTotal || 0}
                          </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        Unidades de produção
                      </Text>
                    </div>
                  </Group>
                </Card>

                {/* Emissões */}
                <Card withBorder p="md">
                  <Group>
                    <ThemeIcon color="orange.4" variant="light" size="lg" radius="md">
                      <IconMountain size={28} stroke={1.5} />
                    </ThemeIcon>

                    <div>
                      <Text size="xs" c="dimmed">
                        Emissões
                      </Text>
                      {isLoading ? (
                          <Skeleton height={28} width={60} />
                      ) : (
                          <Text fw={700} size="xl">
                            {data?.averages.avgKgco2e !== null ? `${formatNumber(data?.averages.avgKgco2e, 2)}` : '-'}
                          </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        kgCO2e
                      </Text>
                    </div>
                  </Group>
                </Card>
              </SimpleGrid>

              {/* Métricas */}
              <Title order={3} mb="md">
                Médias das grandezas mensuradas
              </Title>

              <SimpleGrid cols={{ base: 1, sm: 3, md: 5 }} spacing="md">
                {/* Temperatura */}
                <Card withBorder p="md">
                  <Stack>
                    <Group>
                      <ThemeIcon color="orange.4" variant="light" size="md" radius="md">
                        <IconTemperature size={20} stroke={1.5} />
                      </ThemeIcon>
                      <Text fw={500}>Temperatura</Text>
                    </Group>

                    {isLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Text fw={700} size="xl">
                          {data?.averages.avgTemperatureC !== null
                              ? `${formatNumber(data?.averages.avgTemperatureC, 1)} °C`
                              : 'Sem dados no período'}
                        </Text>
                    )}
                  </Stack>
                </Card>

                {/* Tensão */}
                <Card withBorder p="md">
                  <Stack>
                    <Group>
                      <ThemeIcon color="orange.4" variant="light" size="md" radius="md">
                        <IconBolt size={20} stroke={1.5} />
                      </ThemeIcon>
                      <Text fw={500}>Tensão média</Text>
                    </Group>

                    {isLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Text fw={700} size="xl">
                          {data?.averages.avgVoltageV !== null
                              ? `${formatNumber(data?.averages.avgVoltageV, 1)} V`
                              : 'Sem dados no período'}
                        </Text>
                    )}
                  </Stack>
                </Card>

                {/* Corrente */}
                <Card withBorder p="md">
                  <Stack>
                    <Group>
                      <ThemeIcon color="orange.4" variant="light" size="md" radius="md">
                        <IconCurrentLocation size={20} stroke={1.5} />
                      </ThemeIcon>
                      <Text fw={500}>Corrente média</Text>
                    </Group>

                    {isLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Text fw={700} size="xl">
                          {data?.averages.avgCurrentA !== null
                              ? `${formatNumber(data?.averages.avgCurrentA, 1)} A`
                              : 'Sem dados no período'}
                        </Text>
                    )}
                  </Stack>
                </Card>

                {/* Potência */}
                <Card withBorder p="md">
                  <Stack>
                    <Group>
                      <ThemeIcon color="orange.4" variant="light" size="md" radius="md">
                        <IconBolt size={20} stroke={1.5} />
                      </ThemeIcon>
                      <Text fw={500}>Potência média</Text>
                    </Group>

                    {isLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Text fw={700} size="xl">
                          {data?.averages.avgPowerKw !== null
                              ? `${formatNumber(data?.averages.avgPowerKw, 2)} kW`
                              : 'Sem dados no período'}
                        </Text>
                    )}
                  </Stack>
                </Card>

                {/* Energia */}
                <Card withBorder p="md">
                  <Stack>
                    <Group>
                      <ThemeIcon color="orange.4" variant="light" size="md" radius="md">
                        <IconBolt size={20} stroke={1.5} />
                      </ThemeIcon>
                      <Text fw={500}>Energia média</Text>
                    </Group>

                    {isLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Text fw={700} size="xl">
                          {data?.averages.avgEnergyKwh !== null
                              ? `${formatNumber(data?.averages.avgEnergyKwh, 2)} kWh`
                              : 'Sem dados no período'}
                        </Text>
                    )}
                  </Stack>
                </Card>
              </SimpleGrid>
            </>
        )}
      </Container>
  );
}

export default DashboardHome;
