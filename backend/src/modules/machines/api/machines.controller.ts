import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MachinesService } from '../domain/machines.service';
import { ProvisionRequestDto } from '../domain/dto/provision-request.dto';
import { ProvisionResponseDto } from '../domain/dto/provision-response.dto';
import { MachineDto, MachineDetailDto } from '../domain/dto/machine.dto';
import { MachineQueryDto } from '../domain/dto/machine-query.dto';
import { UpdateMachineDto } from '../domain/dto/update-machine.dto';
import { PaginatedResponseDto } from '../domain/dto/paginated-response.dto';

import { ConfigService } from '@nestjs/config';
import { RolesGuard } from '../../auth/domain/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/domain/guards/jwt-auth.guard';
import { Roles } from '../../auth/domain/decorators/roles.decorator';

@ApiTags('Machines')
@Controller()
export class MachinesController {
  constructor(
    private readonly machinesService: MachinesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('provision')
  @ApiOperation({ summary: 'Provision a device and associate it with a machine' })
  @ApiHeader({
    name: 'x-provision-token',
    description: 'Provisioning token for authentication',
    required: true,
  })
  @ApiCreatedResponse({
    description: 'Device provisioned successfully',
    type: ProvisionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid provisioning token' })
  @ApiConflictResponse({ description: 'Device or machine already paired with another entity' })
  async provision(
    @Headers('x-provision-token') provisionToken: string,
    @Body() dto: ProvisionRequestDto,
  ): Promise<ProvisionResponseDto> {
    const configToken = this.configService.get<string>('PROVISIONING_TOKEN');

    if (!configToken) {
      throw new UnauthorizedException('Provisioning token not configured');
    }

    if (provisionToken !== configToken) {
      throw new UnauthorizedException('Invalid provisioning token');
    }

    return this.machinesService.provision(dto);
  }

  @Get('machines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all machines with optional filtering' })
  @ApiOkResponse({
    description: 'List of machines',
    type: PaginatedResponseDto,
  })
  async findAll(@Query() query: MachineQueryDto): Promise<PaginatedResponseDto<MachineDto>> {
    return this.machinesService.findAll(query);
  }

  @Get('machines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a machine by ID' })
  @ApiOkResponse({
    description: 'Machine details',
    type: MachineDetailDto,
  })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  async findOne(@Param('id') id: string): Promise<MachineDetailDto> {
    try {
      return await this.machinesService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }
  }

  @Patch('machines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a machine' })
  @ApiOkResponse({
    description: 'Machine updated successfully',
    type: MachineDto,
  })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMachineDto,
  ): Promise<MachineDto> {
    return this.machinesService.update(id, dto);
  }

  @Delete('machines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a machine and all related data' })
  @ApiOkResponse({
    description: 'Machine deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Machine not found' })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.machinesService.delete(id);
    return { success };
  }
}
