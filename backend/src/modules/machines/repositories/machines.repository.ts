import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProvisionRequestDto } from '../domain/dto/provision-request.dto';
import {
  MachineQueryDto,
  OrderDirection,
  OrderField,
} from '../domain/dto/machine-query.dto';
import { UpdateMachineDto } from '../domain/dto/update-machine.dto';
import { MachineDto, DeviceDto } from '../domain/dto/machine.dto';
import { MachineStatus, SortOrder, JsonValue } from '../../../prisma/prisma.types';

type DeviceSelect = {
  id: string;
  device_id: string;
  fw_version: string | null;
  last_seen_at: Date | null;
  paired_at: Date | null;
};

type MachineWithDevices = {
  id: string;
  machine_key: string;
  patio_id: string | null;
  manufacturer: string | null;
  model: string | null;
  status: MachineStatus;
  operator_user_id?: string | null;
  meta?: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
  devices?: DeviceSelect[];
};

@Injectable()
export class MachinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // -----------------------
  // Utils
  // -----------------------
  private toJsonObject(
    meta?: Record<string, any> | null,
  ): Record<string, any> | undefined {
    if (!meta) return undefined;
    return meta as Record<string, any>;
  }

  private mergeMetadata(
    existingMeta: JsonValue | null | undefined,
    newMeta: Record<string, any>,
  ): Record<string, any> {
    const existing =
      existingMeta && typeof existingMeta === 'object' && !Array.isArray(existingMeta)
        ? (existingMeta as Record<string, any>)
        : {};
    return { ...existing, ...newMeta };
  }

  private toDeviceDto(d: DeviceSelect): DeviceDto {
    return {
      id: d.id,
      deviceId: d.device_id,
      fwVersion: d.fw_version,
      lastSeenAt: d.last_seen_at,
      pairedAt: d.paired_at,
    };
  }

  private toMachineDto(m: MachineWithDevices): MachineDto {
    const first = m.devices?.[0];
    return {
      id: m.id,
      machineKey: m.machine_key,
      patioId: m.patio_id,
      manufacturer: m.manufacturer,
      model: m.model,
      status: m.status as MachineStatus,
      operatorUserId: m.operator_user_id,
      meta: (m.meta ?? {}) as Record<string, any>,
      createdAt: m.created_at,
      updatedAt: m.updated_at, // ✅ sempre camelCase
      device: first ? this.toDeviceDto(first) : undefined,
      lastSeenAt: first?.last_seen_at ?? null,
    };
  }

  // -----------------------
  // Provision
  // -----------------------
  async provision(dto: ProvisionRequestDto) {
    // 1) Verifica se o device já está pareado com outra máquina
    const existingDevice = await this.prisma.devices.findUnique({
      where: { device_id: dto.deviceId },
      select: { paired_at: true, machine_id: true },
    });

    if (existingDevice?.machine_id) {
      const machineOfDevice = await this.prisma.machines.findUnique({
        where: { id: existingDevice.machine_id },
        select: { machine_key: true },
      });

      if (machineOfDevice && machineOfDevice.machine_key !== dto.machineKey) {
        throw new Error(
          `Device ${dto.deviceId} is already paired with machine ${machineOfDevice.machine_key}`,
        );
      }
    }

    // 2) Verifica se a máquina já está pareada com outro device
    const existingMachine = await this.prisma.machines.findUnique({
      where: { machine_key: dto.machineKey },
      include: { devices: { select: { device_id: true } } },
    });

    const deviceOnMachine = existingMachine?.devices?.[0];
    if (deviceOnMachine && deviceOnMachine.device_id !== dto.deviceId) {
      throw new Error(
        `Machine ${dto.machineKey} is already paired with device ${deviceOnMachine.device_id}`,
      );
    }

    // 3) Upsert machine
    // Recomendação: NÃO setar operator_user_id/patio_id no provisioning (evita P2003 FK)
    const machine = await this.prisma.machines.upsert({
      where: { machine_key: dto.machineKey },
      create: {
        machine_key: dto.machineKey,
        manufacturer: dto.manufacturer || '',
        model: dto.model || '',
        status: dto.status || 'operante',
        meta: this.toJsonObject(dto.meta) ?? {},

        // Se você *realmente* quiser permitir no provision, valide antes:
        // patio_id: dto.patioId ?? undefined,
        // operator_user_id: dto.operatorUserId ?? undefined,
      },
      update: {
        manufacturer: dto.manufacturer ?? undefined,
        model: dto.model ?? undefined,
        status: dto.status ?? undefined,
        meta: dto.meta
          ? this.mergeMetadata(existingMachine?.meta, dto.meta)
          : undefined,

        // idem:
        // patio_id: dto.patioId ?? undefined,
        // operator_user_id: dto.operatorUserId ?? undefined,
      },
    });

    // 4) Upsert device
    const device = await this.prisma.devices.upsert({
      where: { device_id: dto.deviceId },
      create: {
        device_id: dto.deviceId,
        machine_id: machine.id,
        fw_version: dto.fwVersion ?? null,
        last_seen_at: new Date(),
        paired_at: new Date(),
      },
      update: {
        machine_id: machine.id,
        fw_version: dto.fwVersion ?? undefined,
        last_seen_at: new Date(),
        paired_at: existingDevice?.paired_at ?? new Date(),
      },
    });

    return { machine, device };
  }

  // -----------------------
  // Find All
  // -----------------------
  async findAll(query: MachineQueryDto) {
    const {
      search,
      status,
      patioId,
      limit = 50,
      order = OrderDirection.DESC,
      orderBy = OrderField.UPDATED_AT,
    } = query;

    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { machine_key: { contains: search, mode: 'insensitive' } },
        { meta: { path: ['tag'], string_contains: search } },
      ];
    }

    if (status) where.status = status;
    if (patioId) where.patio_id = patioId;

    // ✅ Mapper API -> Prisma
    const orderByMap: Record<OrderField, string> = {
      [OrderField.CREATED_AT]: 'created_at',
      [OrderField.UPDATED_AT]: 'updated_at',
    };

    const prismaOrderBy = orderByMap[orderBy];
    const prismaOrder: SortOrder = order as SortOrder;

    const [data, total] = await Promise.all([
      this.prisma.machines.findMany({
        where,
        include: {
          devices: {
            select: {
              id: true,
              device_id: true,
              fw_version: true,
              last_seen_at: true,
              paired_at: true,
            },
          },
        },
        orderBy: { [prismaOrderBy]: prismaOrder }, // ✅ aqui
        take: limit,
      }),
      this.prisma.machines.count({ where }),
    ]);

    const mappedData = data.map((m) => this.toMachineDto(m as MachineWithDevices));

    return {
      data: mappedData,
      total,
      limit,
      hasMore: total > limit,
    };
  }

  // -----------------------
  // Find One
  // -----------------------
  async findOne(id: string) {
    const machine = await this.prisma.machines.findUnique({
      where: { id },
      include: {
        devices: {
          select: {
            id: true,
            device_id: true,
            fw_version: true,
            last_seen_at: true,
            paired_at: true,
          },
        },
      },
    });

    if (!machine) return null;
    return this.toMachineDto(machine as MachineWithDevices);
  }

  // -----------------------
  // Update
  // -----------------------
  async update(id: string, dto: UpdateMachineDto) {
    const existingMachine = await this.prisma.machines.findUnique({
      where: { id },
      select: { meta: true },
    });

    if (!existingMachine) return null;

    const updated = await this.prisma.machines.update({
      where: { id },
      data: {
        status: dto.status ?? undefined,
        manufacturer: dto.manufacturer ?? undefined,
        model: dto.model ?? undefined,
        patio_id: dto.patioId ?? undefined,
        operator_user_id: dto.operatorUserId ?? undefined,
        meta: dto.meta ? this.mergeMetadata(existingMachine.meta, dto.meta) : undefined,
      },
      include: {
        devices: {
          select: {
            id: true,
            device_id: true,
            fw_version: true,
            last_seen_at: true,
            paired_at: true,
          },
        },
      },
    });

    return this.toMachineDto(updated as MachineWithDevices);
  }

  async updateDeviceLastSeen(machineId: string) {
    await this.prisma.devices.updateMany({
      where: { machine_id: machineId },
      data: { last_seen_at: new Date() },
    });
  }

  // -----------------------
  // Delete
  // -----------------------
  async delete(id: string): Promise<boolean> {
    const machine = await this.prisma.machines.findUnique({
      where: { id },
      include: {
        devices: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!machine) return false;

    // First, update devices to remove the machine_id reference
    // This is necessary because devices don't have onDelete: Cascade
    if (machine.devices && machine.devices.length > 0) {
      await this.prisma.devices.updateMany({
        where: { machine_id: id },
        data: { 
          machine_id: null,
          status: 'provisioning',
          paired_at: null,
        },
      });
    }

    // Then delete the machine (this will cascade delete related entities like telemetry_readings, alarms, etc.)
    await this.prisma.machines.delete({
      where: { id },
    });

    return true;
  }
}
