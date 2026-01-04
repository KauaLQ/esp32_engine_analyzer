import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AlarmDto, AlarmQueryDto, AlarmSeverity, AlarmStatus, CreateAlarmDto } from '../domain/dto';

type AlarmsWhere = Record<string, any>;

@Injectable()
export class AlarmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateAlarmDto, userId?: string): Promise<AlarmDto> {
    const { machineId, type = 'manual', severity, title, details = {}, dedupeKey } = createDto;

    const alarm = await this.prisma.alarms.create({
      data: {
        machine_id: machineId,
        type,
        severity: severity as any,
        status: 'open',
        title,
        details,
        dedupe_key: dedupeKey,
        opened_at: new Date(),
        last_seen_at: new Date(),
      },
    });

    return this.mapToAlarmDto(alarm);
  }

  async findAll(query: AlarmQueryDto) {
    const { machineId, status, severity, from, to, limit = 50 } = query;

    const where: AlarmsWhere = {};

    if (machineId) where.machine_id = machineId;
    if (status) where.status = status as any;
    if (severity) where.severity = severity as any;

    if (from || to) {
      where.opened_at = {};
      if (from) where.opened_at.gte = new Date(from);
      if (to) where.opened_at.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.alarms.findMany({
        where,
        orderBy: { opened_at: 'desc' },
        take: limit,
      }),
      this.prisma.alarms.count({ where }),
    ]);

    return {
      data: data.map(this.mapToAlarmDto),
      total,
      limit,
      hasMore: total > limit,
    };
  }

  async findById(id: string): Promise<AlarmDto | null> {
    const alarm = await this.prisma.alarms.findUnique({
      where: { id },
    });

    return alarm ? this.mapToAlarmDto(alarm) : null;
  }

  async findByDedupeKey(machineId: string, dedupeKey: string, status: AlarmStatus): Promise<AlarmDto | null> {
    const alarm = await this.prisma.alarms.findFirst({
      where: {
        machine_id: machineId,
        dedupe_key: dedupeKey,
        status: status as any,
      },
    });

    return alarm ? this.mapToAlarmDto(alarm) : null;
  }

  async updateLastSeen(id: string): Promise<AlarmDto> {
    const alarm = await this.prisma.alarms.update({
      where: { id },
      data: {
        last_seen_at: new Date(),
      },
    });

    return this.mapToAlarmDto(alarm);
  }

  async updateSeverity(id: string, severity: AlarmSeverity): Promise<AlarmDto> {
    const alarm = await this.prisma.alarms.update({
      where: { id },
      data: {
        severity: severity as any,
      },
    });

    return this.mapToAlarmDto(alarm);
  }

  async updateDetails(id: string, title: string, details: Record<string, any>): Promise<AlarmDto> {
    const alarm = await this.prisma.alarms.update({
      where: { id },
      data: {
        title,
        details,
      },
    });

    return this.mapToAlarmDto(alarm);
  }

  async acknowledge(id: string, userId: string): Promise<AlarmDto> {
    const alarm = await this.prisma.alarms.update({
      where: { id },
      data: {
        status: 'ack',
        ack_at: new Date(),
        ack_by: userId,
      },
    });

    return this.mapToAlarmDto(alarm);
  }

  async close(id: string, userId: string): Promise<AlarmDto> {
    const alarm = await this.prisma.alarms.update({
      where: { id },
      data: {
        status: 'closed',
        closed_at: new Date(),
        closed_by: userId,
      },
    });

    return this.mapToAlarmDto(alarm);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.alarms.delete({
      where: { id },
    });
  }

  private mapToAlarmDto(alarm: any): AlarmDto {
    return {
      id: alarm.id,
      machineId: alarm.machine_id,
      type: alarm.type,
      severity: alarm.severity,
      status: alarm.status,
      title: alarm.title,
      details: alarm.details,
      openedAt: alarm.opened_at.toISOString(),
      lastSeenAt: alarm.last_seen_at.toISOString(),
      ackAt: alarm.ack_at ? alarm.ack_at.toISOString() : undefined,
      closedAt: alarm.closed_at ? alarm.closed_at.toISOString() : undefined,
      dedupeKey: alarm.dedupe_key,
    };
  }
}
