import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MachinesRepository } from '../repositories/machines.repository';
import { ProvisionRequestDto } from './dto/provision-request.dto';
import { MachineDto, MachineDetailDto } from './dto/machine.dto';
import { MachineQueryDto } from './dto/machine-query.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { ProvisionResponseDto } from './dto/provision-response.dto';
import { MachineStatus } from '../../../prisma/prisma.types';

@Injectable()
export class MachinesService {
  constructor(private readonly machinesRepository: MachinesRepository) {}

  async provision(dto: ProvisionRequestDto): Promise<ProvisionResponseDto> {
    try {
      const { machine, device } = await this.machinesRepository.provision(dto);

      return {
        machine: {
          id: machine.id,
          machineKey: machine.machine_key,
          patioId: machine.patio_id,
          manufacturer: machine.manufacturer,
          model: machine.model,
          status: machine.status as MachineStatus,
          operatorUserId: machine.operator_user_id,
          meta: machine.meta as Record<string, any>,
          createdAt: machine.created_at,
          updatedAt: machine.updated_at,
        },
        device: {
          deviceId: device.device_id,
          fwVersion: device.fw_version,
          pairedAt: device.paired_at,
          lastSeenAt: device.last_seen_at,
        },
        telemetry: {
          machineId: machine.id,
          httpEndpoint: '/telemetry',
        },
      };
    } catch (error) {
      if (error.message.includes('already paired')) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  async findAll(query: MachineQueryDto): Promise<PaginatedResponseDto<MachineDto>> {
    const result = await this.machinesRepository.findAll(query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    };
  }

  async findOne(id: string): Promise<MachineDetailDto> {
    const machine = await this.machinesRepository.findOne(id);

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    // For a complete implementation, you might want to fetch the latest telemetry reading here
    // and add it to the response as latestReading
    return {
      ...machine,
      latestReading: undefined, // Optional: fetch from telemetry service if needed
    };
  }

  async update(id: string, dto: UpdateMachineDto): Promise<MachineDto> {
    const machine = await this.machinesRepository.update(id, dto);

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  async updateDeviceLastSeen(machineId: string): Promise<void> {
    await this.machinesRepository.updateDeviceLastSeen(machineId);
  }

  async delete(id: string): Promise<boolean> {
    const machine = await this.machinesRepository.findOne(id);

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return this.machinesRepository.delete(id);
  }
}
