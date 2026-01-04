// MachineDetailsPage.tsx
// ✅ Single-file refactor (services only): machinesApi, telemetryApi, alarmsApi, thresholdsApi
// ✅ Stops refetch spam: React Query cache + enabled per tab + no refetch on focus/mount + debounce filters
// ✅ Keeps ActiveTab context shared across file
//
// Dependencies:
// - @mantine/core, @mantine/hooks
// - @tanstack/react-query
// - react-router-dom
// - @tabler/icons-react (optional)

import React, { createContext, useContext, useMemo, useState } from 'react';
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Divider,
    Group,
    Loader,
    SegmentedControl,
    Stack,
    Tabs,
    Text,
    Title,
    Table,
    Pagination,
    Modal,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconRefresh } from '@tabler/icons-react';
import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ✅ Your services (already configured with Bearer token via http)
import machinesApi from '../../../services/api/machines.api';
import alarmsApi from '../../../services/api/alarms.api';
import telemetryApi from '../../../services/api/telemetry.api';
import thresholdsApi from '../../../services/api/thresholds.api';

// ===============================
// Types (kept local to avoid coupling to unknown backend shapes)
// ===============================
type TabValue = 'overview' | 'telemetry' | 'alarms' | 'thresholds';
type MachineStatus = 'operante' | 'inoperante' | 'manutencao';

type MachineDto = {
    id: string;
    name?: string;
    status?: MachineStatus | string;
    createdAt?: string;
    updatedAt?: string;
};

type TelemetryMultiSeriesValuesDto = {
    voltageV?: number | null;
    currentA?: number | null;
    temperatureC?: number | null;
};

type TelemetryMultiSeriesPointDto = {
    ts: string;
    values: TelemetryMultiSeriesValuesDto;
};

type TelemetryMultiSeriesResponseDto = {
    data: TelemetryMultiSeriesPointDto[];
    total?: number;
    bucket?: string;
    fill?: string;
    from?: string;
    to?: string;
};

type AlarmDto = {
    id: string;
    ts: string;
    severity?: 'low' | 'medium' | 'high' | string;
    type?: string;
    message?: string;
};

type ThresholdDto = {
    id: string;
    metric: 'voltage' | 'current' | 'temperature' | string;
    min?: number | null;
    max?: number | null;
    createdAt: string;
};

// ===============================
// Helpers (normalize unknown response shapes)
// ===============================
function pickArray<T = any>(payload: any): T[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.alarms)) return payload.alarms;
    if (Array.isArray(payload.thresholds)) return payload.thresholds;
    return [];
}

function pickDataObject(payload: any) {
    if (!payload) return payload;
    // some APIs return { data: {...} }
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data;
    return payload;
}

// ===============================
// Telemetry formatting helpers
// ===============================
function formatVoltage(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(2)} V`;
}

function formatCurrent(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(2)} A`;
}

function formatTemperature(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(1)} °C`;
}

function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
}

// ===============================
// Status helpers
// ===============================
const statusColor = {
    operante: 'green',
    inoperante: 'red',
    manutencao: 'yellow',
} as const;

type StatusKey = keyof typeof statusColor;

function isStatusKey(v: unknown): v is StatusKey {
    return v === 'operante' || v === 'inoperante' || v === 'manutencao';
}

// ===============================
// Filters
// ===============================
type Fill = 'none' | 'zero';
type RangePreset = '24h' | '7d' | '30d';
type Bucket = '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '1d';
type MetricsMode = 'all' | 'v+i' | 't';

function makeIsoRange(preset: RangePreset) {
    const to = new Date();
    const ms =
        preset === '24h'
            ? 24 * 60 * 60 * 1000
            : preset === '7d'
                ? 7 * 24 * 60 * 60 * 1000
                : 30 * 24 * 60 * 60 * 1000;

    const from = new Date(to.getTime() - ms);
    return { from: from.toISOString(), to: to.toISOString() };
}

// ===============================
// ActiveTab Context (shared in-file)
// ===============================
type ActiveTabContextValue = {
    activeTab: TabValue;
    setActiveTab: React.Dispatch<React.SetStateAction<TabValue>>;
    onTabChange: (value: string | null) => void; // Mantine Tabs signature
};

const ActiveTabContext = createContext<ActiveTabContextValue | null>(null);

function useActiveTab() {
    const ctx = useContext(ActiveTabContext);
    if (!ctx) throw new Error('useActiveTab must be used inside <ActiveTabProvider>');
    return ctx;
}

function ActiveTabProvider({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState<TabValue>('overview');

    const onTabChange = (value: string | null) => {
        setActiveTab((value as TabValue) ?? 'overview');
    };

    const memo = useMemo(() => ({ activeTab, setActiveTab, onTabChange }), [activeTab]);
    return <ActiveTabContext.Provider value={memo}>{children}</ActiveTabContext.Provider>;
}

// ===============================
// Route wrapper (reads :id and passes as prop)
// ===============================
export function MachineDetailsRoute() {
    const { id } = useParams<{ id: string }>();
    if (!id) return <Navigate to="/app/machines" replace />;
    return <MachineDetailsPage machineId={id} />;
}

// ===============================
// Exported Page
// ===============================
export default function MachineDetailsPage({ machineId }: { machineId: string }) {
    return (
        <ActiveTabProvider>
            <MachineDetailsContent machineId={machineId} />
        </ActiveTabProvider>
    );
}

// ===============================
// Main Content
// ===============================
function MachineDetailsContent({ machineId }: { machineId: string }) {
    const { activeTab, onTabChange } = useActiveTab();

    // filters
    const [preset, setPreset] = useState<RangePreset>('24h');
    const [{ from, to }, setRange] = useState(() => makeIsoRange('24h'));
    const [bucket, setBucket] = useState<Bucket>('1h');
    const [fill] = useState<Fill>('none');
    const [metricsMode, setMetricsMode] = useState<MetricsMode>('all');

    // update range when preset changes (no loop)
    React.useEffect(() => {
        setRange(makeIsoRange(preset));
    }, [preset]);

    // debounce filters
    const [dFrom] = useDebouncedValue(from, 350);
    const [dTo] = useDebouncedValue(to, 350);
    const [dBucket] = useDebouncedValue(bucket, 350);
    const [dFill] = useDebouncedValue(fill, 350);
    const [dMetricsMode] = useDebouncedValue(metricsMode, 350);

    const metricsParam =
        dMetricsMode === 'all'
            ? 'voltage,current,temperature'
            : dMetricsMode === 'v+i'
                ? 'voltage,current'
                : 'temperature';

    // ---------------------------
    // Queries (services-only)
    // ---------------------------
    const machineQuery = useQuery({
        queryKey: ['machine', machineId],
        queryFn: async (): Promise<MachineDto> => {
            const res = await machinesApi.getMachine(machineId);
            // if your api returns {data:{...}}, normalize:
            return pickDataObject(res) as MachineDto;
        },
        enabled: !!machineId,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const telemetryQuery = useQuery({
        queryKey: ['telemetry-multi', machineId, dFrom, dTo, dBucket, dFill, metricsParam],
        queryFn: async (): Promise<TelemetryMultiSeriesResponseDto> => {
            const res = await telemetryApi.getTelemetrySeries({
                machineId,
                from: dFrom,
                to: dTo,
                bucket: dBucket,
                fill: dFill,
                metrics: metricsParam,
            } as any);

            // normalize: expected shape similar to { data: [...] }
            const payload = pickDataObject(res);
            return {
                ...payload,
                data: pickArray<TelemetryMultiSeriesPointDto>(payload),
            } as TelemetryMultiSeriesResponseDto;
        },
        enabled: activeTab === 'telemetry' && !!machineId,
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const alarmsQuery = useQuery({
        queryKey: ['alarms', machineId, dFrom, dTo],
        queryFn: async (): Promise<AlarmDto[]> => {
            const res = await alarmsApi.getAlarms({
                machineId,
                from: dFrom,
                to: dTo,
            } as any);

            const payload = pickDataObject(res);
            return pickArray<AlarmDto>(payload);
        },
        enabled: activeTab === 'alarms' && !!machineId,
        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    // Thresholds: active + history (two endpoints)
    const activeThresholdQuery = useQuery({
        queryKey: ['threshold-active', machineId],
        queryFn: async (): Promise<ThresholdDto | null> => {
            const res = await thresholdsApi.getActiveThreshold(machineId);
            const payload = pickDataObject(res);
            return (payload ?? null) as ThresholdDto | null;
        },
        enabled: activeTab === 'thresholds' && !!machineId,
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const thresholdHistoryQuery = useQuery({
        queryKey: ['threshold-history', machineId],
        queryFn: async (): Promise<ThresholdDto[]> => {
            const res = await thresholdsApi.getThresholdHistory(machineId);
            const payload = pickDataObject(res);
            return pickArray<ThresholdDto>(payload);
        },
        enabled: activeTab === 'thresholds' && !!machineId,
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    // status badge
    const rawStatus = machineQuery.data?.status;
    const status: StatusKey = isStatusKey(rawStatus) ? rawStatus : 'operante';

    const refreshVisible = async () => {
        if (activeTab === 'overview') await machineQuery.refetch();
        if (activeTab === 'telemetry') await telemetryQuery.refetch();
        if (activeTab === 'alarms') await alarmsQuery.refetch();
        if (activeTab === 'thresholds') {
            await activeThresholdQuery.refetch();
            await thresholdHistoryQuery.refetch();
        }
    };

    return (
        <Stack gap="md">
            <Card withBorder>
                <Group justify="space-between" align="center">
                    <Stack gap={2}>
                        <Title order={3}>
                            {machineQuery.isLoading ? 'Carregando…' : machineQuery.data?.name ?? 'Detalhes da máquina'}
                        </Title>

                        <Group gap="sm">
                            <Badge variant="light" color={statusColor[status]}>
                                {status}
                            </Badge>

                            {machineQuery.data?.id && (
                                <Text size="sm" c="dimmed">
                                    ID: {machineQuery.data.id}
                                </Text>
                            )}
                        </Group>
                    </Stack>

                    <Group gap="xs">
                        <ActionIcon variant="light" onClick={refreshVisible} aria-label="Atualizar">
                            <IconRefresh size={18} />
                        </ActionIcon>
                    </Group>
                </Group>

                <Divider my="md" />

                <Group gap="md" wrap="wrap">
                    <SegmentedControl
                        value={preset}
                        onChange={(v) => setPreset(v as RangePreset)}
                        data={[
                            { value: '24h', label: '24h' },
                            { value: '7d', label: '7d' },
                            { value: '30d', label: '30d' },
                        ]}
                    />

                    <SegmentedControl
                        value={bucket}
                        onChange={(v) => setBucket(v as Bucket)}
                        data={[
                            { value: '1m', label: '1m' },
                            { value: '5m', label: '5m' },
                            { value: '15m', label: '15m' },
                            { value: '30m', label: '30m' },
                            { value: '1h', label: '1h' },
                            { value: '6h', label: '6h' },
                            { value: '1d', label: '1d' },
                        ]}
                    />


                    <SegmentedControl
                        value={metricsMode}
                        onChange={(v) => setMetricsMode(v as MetricsMode)}
                        data={[
                            { value: 'all', label: 'V+I+T' },
                            { value: 'v+i', label: 'V+I' },
                            { value: 't', label: 'T' },
                        ]}
                    />
                </Group>
            </Card>

            <Tabs value={activeTab} onChange={onTabChange} keepMounted={false}>
                <Tabs.List>
                    <Tabs.Tab value="overview">Visão geral</Tabs.Tab>
                    <Tabs.Tab value="telemetry">Telemetria</Tabs.Tab>
                    <Tabs.Tab value="alarms">Alarmes</Tabs.Tab>
                    <Tabs.Tab value="thresholds">Thresholds</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="md">
                    <OverviewPanel machine={machineQuery.data} loading={machineQuery.isLoading} error={machineQuery.isError} />
                </Tabs.Panel>

                <Tabs.Panel value="telemetry" pt="md">
                    <TelemetryPanel
                        data={telemetryQuery.data}
                        loading={telemetryQuery.isLoading}
                        error={telemetryQuery.isError}
                        from={from}
                        to={to}
                        bucket={bucket}
                        fill={fill}
                        metrics={metricsParam}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="alarms" pt="md">
                    <AlarmsPanel alarms={alarmsQuery.data ?? []} loading={alarmsQuery.isLoading} error={alarmsQuery.isError} />
                </Tabs.Panel>

                <Tabs.Panel value="thresholds" pt="md">
                    <ThresholdsPanel
                        active={activeThresholdQuery.data ?? null}
                        history={thresholdHistoryQuery.data ?? []}
                        loading={activeThresholdQuery.isLoading || thresholdHistoryQuery.isLoading}
                        error={activeThresholdQuery.isError || thresholdHistoryQuery.isError}
                    />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}

// ===============================
// Panels
// ===============================
function OverviewPanel({
                           machine,
                           loading,
                           error,
                       }: {
    machine?: MachineDto;
    loading: boolean;
    error: boolean;
}) {
    return (
        <Card withBorder>
            {loading ? (
                <Group>
                    <Loader size="sm" />
                    <Text>Carregando…</Text>
                </Group>
            ) : error ? (
                <Text c="red">Erro ao carregar visão geral.</Text>
            ) : (
                <Stack gap={6}>
                    <Text size="sm">
                        <b>ID:</b> {machine?.id ?? '—'}
                    </Text>
                    <Text size="sm">
                        <b>Status:</b> {machine?.status ?? '—'}
                    </Text>
                    {machine?.createdAt && (
                        <Text size="sm">
                            <b>Criado:</b> {new Date(machine.createdAt).toLocaleString()}
                        </Text>
                    )}
                    {machine?.updatedAt && (
                        <Text size="sm">
                            <b>Atualizado:</b> {new Date(machine.updatedAt).toLocaleString()}
                        </Text>
                    )}
                </Stack>
            )}
        </Card>
    );
}

function TelemetryPanel({
                            data,
                            loading,
                            error,
                            from,
                            to,
                            bucket,
                            fill,
                            metrics,
                        }: {
    data?: TelemetryMultiSeriesResponseDto;
    loading: boolean;
    error: boolean;
    from: string;
    to: string;
    bucket: string;
    fill: string;
    metrics: string;
}) {
    const points = data?.data ?? [];
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 5;

    // Calculate pagination
    const totalPages = Math.ceil(points.length / itemsPerPage);
    const paginatedPoints = points.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    // Prepare data for charts
    const chartData = points.map(point => ({
        timestamp: new Date(point.ts).getTime(),
        voltage: point.values.voltageV,
        current: point.values.currentA,
        temperature: point.values.temperatureC
    }));

    // Determine which metrics to show based on the metrics parameter
    const showVoltage = metrics.includes('voltage');
    const showCurrent = metrics.includes('current');
    const showTemperature = metrics.includes('temperature');

    return (
        <Card withBorder>
            <Group justify="space-between" align="center" mb="sm">
                <Text fw={600}>Telemetria</Text>
                <Text size="sm" c="dimmed">
                    {metrics} • bucket {bucket} • fill {fill}
                </Text>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
                {formatTimestamp(from)} → {formatTimestamp(to)}
            </Text>

            {loading ? (
                <Group>
                    <Loader size="sm" />
                    <Text>Carregando telemetria…</Text>
                </Group>
            ) : error ? (
                <Text c="red">Erro ao carregar telemetria.</Text>
            ) : points.length === 0 ? (
                <Text size="sm">Sem dados no período.</Text>
            ) : (
                <Stack gap="lg">
                    <Card withBorder>
                        <Text size="sm" fw={600} mb="md">
                            Último ponto de medição
                        </Text>
                        <Group>
                            <Stack gap={2}>
                                <Text size="sm" fw={500}>Timestamp</Text>
                                <Text size="sm">{formatTimestamp(points[points.length - 1].ts)}</Text>
                            </Stack>

                            {showVoltage && (
                                <Stack gap={2}>
                                    <Text size="sm" fw={500}>Tensão</Text>
                                    <Text size="sm">{formatVoltage(points[points.length - 1].values.voltageV)}</Text>
                                </Stack>
                            )}

                            {showCurrent && (
                                <Stack gap={2}>
                                    <Text size="sm" fw={500}>Corrente</Text>
                                    <Text size="sm">{formatCurrent(points[points.length - 1].values.currentA)}</Text>
                                </Stack>
                            )}

                            {showTemperature && (
                                <Stack gap={2}>
                                    <Text size="sm" fw={500}>Temperatura</Text>
                                    <Text size="sm">{formatTemperature(points[points.length - 1].values.temperatureC)}</Text>
                                </Stack>
                            )}
                        </Group>
                    </Card>

                    <Card withBorder>
                        <Text size="sm" fw={600} mb="md">
                            Histórico de medições
                        </Text>

                        <Table mb="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Timestamp</Table.Th>
                                    {showVoltage && <Table.Th>Tensão</Table.Th>}
                                    {showCurrent && <Table.Th>Corrente</Table.Th>}
                                    {showTemperature && <Table.Th>Temperatura</Table.Th>}
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {paginatedPoints.map((point, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{formatTimestamp(point.ts)}</Table.Td>
                                        {showVoltage && <Table.Td>{formatVoltage(point.values.voltageV)}</Table.Td>}
                                        {showCurrent && <Table.Td>{formatCurrent(point.values.currentA)}</Table.Td>}
                                        {showTemperature && <Table.Td>{formatTemperature(point.values.temperatureC)}</Table.Td>}
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>

                        <Group justify="center" mb="md">
                            <Pagination 
                                value={activePage} 
                                onChange={setActivePage} 
                                total={totalPages} 
                                size="sm"
                            />
                        </Group>

                        <Text size="sm" c="dimmed" ta="center" mb="md">
                            Mostrando {paginatedPoints.length} de {points.length} pontos
                        </Text>
                    </Card>

                    {/* Charts */}
                    {points.length > 0 && (
                        <Card withBorder>
                            <Text size="sm" fw={600} mb="md">
                                Gráficos de telemetria
                            </Text>

                            <Stack gap="xl">
                                {showVoltage && (
                                    <div>
                                        <Text size="sm" fw={500} mb="xs">Tensão (V)</Text>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="timestamp" 
                                                    type="number"
                                                    domain={['auto', 'auto']}
                                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                                />
                                                <YAxis />
                                                <Tooltip 
                                                    labelFormatter={(timestamp) => formatTimestamp(new Date(timestamp).toISOString())}
                                                    formatter={(value) => [formatVoltage(value as number), 'Tensão']}
                                                />
                                                <Legend />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="voltage" 
                                                    name="Tensão" 
                                                    stroke="#8884d8" 
                                                    activeDot={{ r: 8 }} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {showCurrent && (
                                    <div>
                                        <Text size="sm" fw={500} mb="xs">Corrente (A)</Text>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="timestamp" 
                                                    type="number"
                                                    domain={['auto', 'auto']}
                                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                                />
                                                <YAxis />
                                                <Tooltip 
                                                    labelFormatter={(timestamp) => formatTimestamp(new Date(timestamp).toISOString())}
                                                    formatter={(value) => [formatCurrent(value as number), 'Corrente']}
                                                />
                                                <Legend />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="current" 
                                                    name="Corrente" 
                                                    stroke="#82ca9d" 
                                                    activeDot={{ r: 8 }} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {showTemperature && (
                                    <div>
                                        <Text size="sm" fw={500} mb="xs">Temperatura (°C)</Text>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="timestamp" 
                                                    type="number"
                                                    domain={['auto', 'auto']}
                                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                                />
                                                <YAxis />
                                                <Tooltip 
                                                    labelFormatter={(timestamp) => formatTimestamp(new Date(timestamp).toISOString())}
                                                    formatter={(value) => [formatTemperature(value as number), 'Temperatura']}
                                                />
                                                <Legend />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="temperature" 
                                                    name="Temperatura" 
                                                    stroke="#ff7300" 
                                                    activeDot={{ r: 8 }} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </Stack>
                        </Card>
                    )}
                </Stack>
            )}
        </Card>
    );
}

function AlarmsPanel({
                         alarms,
                         loading,
                         error,
                     }: {
    alarms: AlarmDto[];
    loading: boolean;
    error: boolean;
}) {
    const [selectedAlarm, setSelectedAlarm] = useState<AlarmDto | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Get severity color
    const getSeverityColor = (severity: string | undefined) => {
        switch(severity) {
            case 'high': return 'red';
            case 'medium': return 'orange';
            case 'low': return 'yellow';
            default: return 'gray';
        }
    };

    const openAlarmDetails = (alarm: AlarmDto) => {
        setSelectedAlarm(alarm);
        setModalOpen(true);
    };

    return (
        <Card withBorder>
            <Group justify="space-between" align="center" mb="sm">
                <Text fw={600}>Alarmes</Text>
                <Text size="sm" c="dimmed">
                    {alarms.length} itens
                </Text>
            </Group>

            {loading ? (
                <Group>
                    <Loader size="sm" />
                    <Text>Carregando alarmes…</Text>
                </Group>
            ) : error ? (
                <Text c="red">Erro ao carregar alarmes.</Text>
            ) : alarms.length === 0 ? (
                <Text size="sm">Sem alarmes no período.</Text>
            ) : (
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Severidade</Table.Th>
                            <Table.Th>Tipo</Table.Th>
                            <Table.Th>Data</Table.Th>
                            <Table.Th>Ações</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {alarms.slice(0, 50).map((alarm) => (
                            <Table.Tr key={alarm.id}>
                                <Table.Td>
                                    <Badge color={getSeverityColor(alarm.severity)}>
                                        {alarm.severity || 'N/A'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>{alarm.type || 'Alarme'}</Table.Td>
                                <Table.Td>{new Date(alarm.ts).toLocaleString()}</Table.Td>
                                <Table.Td>
                                    <Button 
                                        variant="subtle" 
                                        size="xs" 
                                        onClick={() => openAlarmDetails(alarm)}
                                    >
                                        Detalhes
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}

            {/* Alarm Details Modal */}
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={<Text fw={700}>Detalhes do Alarme</Text>}
                size="md"
            >
                {selectedAlarm && (
                    <Stack gap="md">
                        <Group>
                            <Text fw={600}>Tipo:</Text>
                            <Text>{selectedAlarm.type || 'Alarme'}</Text>
                        </Group>

                        <Group>
                            <Text fw={600}>Severidade:</Text>
                            <Badge color={getSeverityColor(selectedAlarm.severity)}>
                                {selectedAlarm.severity || 'N/A'}
                            </Badge>
                        </Group>

                        <Group>
                            <Text fw={600}>Data:</Text>
                            <Text>{new Date(selectedAlarm.ts).toLocaleString()}</Text>
                        </Group>

                        {selectedAlarm.message && (
                            <Group align="flex-start">
                                <Text fw={600}>Mensagem:</Text>
                                <Text>{selectedAlarm.message}</Text>
                            </Group>
                        )}

                        <Group>
                            <Text fw={600}>ID:</Text>
                            <Text size="sm" c="dimmed">{selectedAlarm.id}</Text>
                        </Group>

                        <Button 
                            fullWidth 
                            variant="light" 
                            onClick={() => setModalOpen(false)}
                            mt="md"
                        >
                            Fechar
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Card>
    );
}

function ThresholdsPanel({
                             active,
                             history,
                             loading,
                             error,
                         }: {
    active: ThresholdDto | null;
    history: ThresholdDto[];
    loading: boolean;
    error: boolean;
}) {
    const [selectedThreshold, setSelectedThreshold] = useState<ThresholdDto | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

// Get metric color (defensivo)
    const getMetricColor = (metric: unknown) => {
        const m = typeof metric === 'string' ? metric.toLowerCase() : '';
        switch (m) {
            case 'voltage': return 'blue';
            case 'current': return 'green';
            case 'temperature': return 'orange';
            default: return 'gray';
        }
    };

// Format metric name for display (defensivo)
    const formatMetricName = (metric: unknown) => {
        const m = typeof metric === 'string' ? metric.toLowerCase() : '';
        switch (m) {
            case 'voltage': return 'Tensão';
            case 'current': return 'Corrente';
            case 'temperature': return 'Temperatura';
            default: return typeof metric === 'string' && metric.trim() ? metric : '—';
        }
    };

// Format metric unit for display (defensivo)
    const formatMetricUnit = (metric: unknown) => {
        const m = typeof metric === 'string' ? metric.toLowerCase() : '';
        switch (m) {
            case 'voltage': return 'V';
            case 'current': return 'A';
            case 'temperature': return '°C';
            default: return '';
        }
    };

    const openThresholdDetails = (threshold: ThresholdDto) => {
        setSelectedThreshold(threshold);
        setModalOpen(true);
    };

    return (
        <Card withBorder>
            <Group justify="space-between" align="center" mb="sm">
                <Text fw={600}>Thresholds</Text>
                <Text size="sm" c="dimmed">
                    {history.length} no histórico
                </Text>
            </Group>

            {loading ? (
                <Group>
                    <Loader size="sm" />
                    <Text>Carregando thresholds…</Text>
                </Group>
            ) : error ? (
                <Text c="red">Erro ao carregar thresholds.</Text>
            ) : (
                <Stack gap="md">
                    {/* Active Threshold */}
                    <Card withBorder p="md">
                        <Text fw={600} size="sm" mb="xs">Threshold Ativo</Text>

                        {!active ? (
                            <Text size="sm" c="dimmed">Nenhum threshold ativo encontrado.</Text>
                        ) : (
                            <Group justify="space-between">
                                <Group>
                                    <Badge color={getMetricColor(active.metric)}>
                                        {formatMetricName(active.metric)}
                                    </Badge>
                                    <Text size="sm">
                                        {active.min !== null && active.min !== undefined ? `Min: ${active.min} ${formatMetricUnit(active.metric)}` : ''}
                                        {active.min !== null && active.min !== undefined && active.max !== null && active.max !== undefined ? ' • ' : ''}
                                        {active.max !== null && active.max !== undefined ? `Max: ${active.max} ${formatMetricUnit(active.metric)}` : ''}
                                    </Text>
                                </Group>

                                <Button 
                                    variant="light" 
                                    size="xs" 
                                    onClick={() => openThresholdDetails(active)}
                                >
                                    Detalhes
                                </Button>
                            </Group>
                        )}
                    </Card>

                    <Divider />

                    {/* Threshold History */}
                    <Text fw={600} size="sm">Histórico de Thresholds</Text>

                    {history.length === 0 ? (
                        <Text size="sm">Sem thresholds no histórico.</Text>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Métrica</Table.Th>
                                    <Table.Th>Limites</Table.Th>
                                    <Table.Th>Data de Criação</Table.Th>
                                    <Table.Th>Ações</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {history.slice(0, 10).map((threshold) => (
                                    <Table.Tr key={threshold.id}>
                                        <Table.Td>
                                            <Badge color={getMetricColor(threshold.metric)}>
                                                {formatMetricName(threshold.metric)}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {threshold.min !== null && threshold.min !== undefined ? `Min: ${threshold.min} ${formatMetricUnit(threshold.metric)}` : '—'}
                                            {threshold.min !== null && threshold.min !== undefined && threshold.max !== null && threshold.max !== undefined ? ' • ' : ''}
                                            {threshold.max !== null && threshold.max !== undefined ? `Max: ${threshold.max} ${formatMetricUnit(threshold.metric)}` : '—'}
                                        </Table.Td>
                                        <Table.Td>{new Date(threshold.createdAt).toLocaleString()}</Table.Td>
                                        <Table.Td>
                                            <Button 
                                                variant="subtle" 
                                                size="xs" 
                                                onClick={() => openThresholdDetails(threshold)}
                                            >
                                                Detalhes
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Stack>
            )}

            {/* Threshold Details Modal */}
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={<Text fw={700}>Detalhes do Threshold</Text>}
                size="md"
            >
                {selectedThreshold && (
                    <Stack gap="md">
                        <Group>
                            <Text fw={600}>Métrica:</Text>
                            <Badge color={getMetricColor(selectedThreshold.metric)}>
                                {formatMetricName(selectedThreshold.metric)}
                            </Badge>
                        </Group>

                        <Group>
                            <Text fw={600}>Valor Mínimo:</Text>
                            <Text>
                                {selectedThreshold.min !== null && selectedThreshold.min !== undefined 
                                    ? `${selectedThreshold.min} ${formatMetricUnit(selectedThreshold.metric)}` 
                                    : 'Não definido'}
                            </Text>
                        </Group>

                        <Group>
                            <Text fw={600}>Valor Máximo:</Text>
                            <Text>
                                {selectedThreshold.max !== null && selectedThreshold.max !== undefined 
                                    ? `${selectedThreshold.max} ${formatMetricUnit(selectedThreshold.metric)}` 
                                    : 'Não definido'}
                            </Text>
                        </Group>

                        <Group>
                            <Text fw={600}>Data de Criação:</Text>
                            <Text>{new Date(selectedThreshold.createdAt).toLocaleString()}</Text>
                        </Group>

                        <Group>
                            <Text fw={600}>ID:</Text>
                            <Text size="sm" c="dimmed">{selectedThreshold.id}</Text>
                        </Group>

                        <Divider my="sm" />

                        <Text size="sm" c="dimmed">
                            Este threshold define os limites operacionais para {formatMetricName(selectedThreshold.metric).toLowerCase()} 
                            da máquina. Valores fora destes limites podem gerar alarmes.
                        </Text>

                        <Button 
                            fullWidth 
                            variant="light" 
                            onClick={() => setModalOpen(false)}
                            mt="md"
                        >
                            Fechar
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Card>
    );
}
