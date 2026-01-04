import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PatiosRepository } from '../repositories/patios.repository';
import {
  CreatePatioDto,
  MachinesInPatioQueryDto,
  PaginatedResponseDto,
  PatioDto,
  PatioPublicDto,
  PatioQueryDto,
  UpdatePatioDto,
} from './dto';

@Injectable()
export class PatiosService {
  constructor(private readonly patiosRepository: PatiosRepository) {}

  async create(dto: CreatePatioDto): Promise<PatioDto> {
    return this.patiosRepository.create(dto);
  }

  async findAll(query: PatioQueryDto): Promise<PaginatedResponseDto<PatioDto>> {
    const result = await this.patiosRepository.findAll(query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    };
  }

  async findPublic(): Promise<PatioPublicDto[]> {
    return this.patiosRepository.findPublic();
  }

  async findOne(id: string): Promise<PatioDto> {
    const patio = await this.patiosRepository.findOne(id);

    if (!patio) {
      throw new NotFoundException(`Patio with ID ${id} not found`);
    }

    return patio;
  }

  async update(id: string, dto: UpdatePatioDto): Promise<PatioDto> {
    const patio = await this.patiosRepository.update(id, dto);

    if (!patio) {
      throw new NotFoundException(`Patio with ID ${id} not found`);
    }

    return patio;
  }

  async delete(id: string): Promise<void> {
    const result = await this.patiosRepository.delete(id);

    if (result === false) {
      // Check if patio exists
      const patio = await this.patiosRepository.findOne(id);
      if (!patio) {
        throw new NotFoundException(`Patio with ID ${id} not found`);
      }

      // If patio exists but couldn't be deleted, it has machines
      throw new ConflictException(`Cannot delete patio with ID ${id} because it has machines assigned to it`);
    }
  }

  async findMachinesInPatio(patioId: string, query: MachinesInPatioQueryDto): Promise<PaginatedResponseDto<any>> {
    // Check if patio exists
    const patio = await this.patiosRepository.findOne(patioId);
    if (!patio) {
      throw new NotFoundException(`Patio with ID ${patioId} not found`);
    }

    const result = await this.patiosRepository.findMachinesInPatio(patioId, query);

    return {
      data: result.data,
      meta: {
        total: result.total,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    };
  }
}
