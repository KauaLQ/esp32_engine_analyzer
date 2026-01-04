import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePatioDto, PatioDto, PatioPublicDto, PatioQueryDto, UpdatePatioDto } from '../domain/dto';
import { MachinesInPatioQueryDto } from '../domain/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type PatiosWhere = Record<string, any>;
type MachinesWhere = Record<string, any>;

@Injectable()
export class PatiosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatioDto): Promise<PatioDto> {
    const patio = await this.prisma.patios.create({
      data: {
        name: dto.name,
        address: dto.address,
      },
    });

    return this.mapToPatioDto(patio);
  }

  async findAll(query: PatioQueryDto) {
    const { search, limit = 50, order = 'desc' } = query;

    const where: PatiosWhere = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.patios.findMany({
        where,
        take: limit,
        orderBy: { updated_at: order },
      }),
      this.prisma.patios.count({ where }),
    ]);

    const patios = data.map(this.mapToPatioDto);

    return {
      data: patios,
      total,
      limit,
      hasMore: total > limit,
    };
  }

  async findPublic(): Promise<PatioPublicDto[]> {
    const patios = await this.prisma.patios.findMany({
      select: {
        id: true,
        name: true,
        address: true,
      },
    });

    return patios.map((patio) => ({
      patioId: patio.id,
      name: patio.name,
      address: patio.address,
    }));
  }

  async findOne(id: string): Promise<PatioDto | null> {
    const patio = await this.prisma.patios.findUnique({
      where: { id },
    });

    if (!patio) {
      return null;
    }

    return this.mapToPatioDto(patio);
  }

  async update(id: string, dto: UpdatePatioDto): Promise<PatioDto | null> {
    try {
      const patio = await this.prisma.patios.update({
        where: { id },
        data: {
          name: dto.name,
          address: dto.address,
        },
      });

      return this.mapToPatioDto(patio);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return null; // Record not found
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Check if patio has machines
      const machineCount = await this.prisma.machines.count({
        where: { patio_id: id },
      });

      if (machineCount > 0) {
        return false; // Cannot delete patio with machines
      }

      await this.prisma.patios.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return false; // Record not found
        }
      }
      throw error;
    }
  }

  async findMachinesInPatio(patioId: string, query: MachinesInPatioQueryDto) {
    const { search, status, limit = 50, order = 'desc' } = query;

    const where: MachinesWhere = {
      patio_id: patioId,
    };

    if (search) {
      where.OR = [
        { machine_key: { contains: search, mode: 'insensitive' } },
        { meta: { path: ['tag'], string_contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.machines.findMany({
        where,
        take: limit,
        orderBy: { updated_at: order },
        include: {
          patios: true,
          devices: {
            select: {
              device_id: true,
              fw_version: true,
              last_seen_at: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.machines.count({ where }),
    ]);

    const machines = data.map((machine) => ({
      id: machine.id,
      machineKey: machine.machine_key,
      patioId: machine.patio_id,
      patioName: machine.patios?.name,
      manufacturer: machine.manufacturer,
      model: machine.model,
      status: machine.status,
      operatorUserId: machine.operator_user_id,
      meta: machine.meta as Record<string, any>,
      createdAt: machine.created_at,
      updatedAt: machine.updated_at,
      device: machine.devices?.[0]
        ? {
            deviceId: machine.devices[0].device_id,
            fwVersion: machine.devices[0].fw_version,
            lastSeenAt: machine.devices[0].last_seen_at,
            status: machine.devices[0].status,
          }
        : undefined,
    }));

    return {
      data: machines,
      total,
      limit,
      hasMore: total > limit,
    };
  }

  private mapToPatioDto(patio: any): PatioDto {
    return {
      id: patio.id,
      name: patio.name,
      address: patio.address,
      createdAt: patio.created_at,
      updatedAt: patio.updated_at,
    };
  }
}
