import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PatiosService } from '../domain/patios.service';
import {
  CreatePatioDto,
  MachinesInPatioQueryDto,
  PaginatedResponseDto,
  PatioDto,
  PatioPublicDto,
  PatioQueryDto,
  UpdatePatioDto,
} from '../domain/dto';
import { JwtAuthGuard } from '../../auth/domain/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/domain/guards/roles.guard';
import { Roles } from '../../auth/domain/decorators/roles.decorator';

@ApiTags('Patios')
@Controller('patios')
export class PatiosController {
  constructor(private readonly patiosService: PatiosService) {}

  // Public endpoint - no authentication required
  @Get('public')
  @ApiOperation({ summary: 'Get all patios (public endpoint)' })
  @ApiOkResponse({
    description: 'List of patios (public data)',
    type: [PatioPublicDto],
  })
  async findPublic(): Promise<PatioPublicDto[]> {
    return this.patiosService.findPublic();
  }

  // Authenticated endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new patio' })
  @ApiCreatedResponse({
    description: 'Patio created successfully',
    type: PatioDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Body() dto: CreatePatioDto): Promise<PatioDto> {
    return this.patiosService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all patios with optional filtering' })
  @ApiOkResponse({
    description: 'List of patios',
    type: PaginatedResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(@Query() query: PatioQueryDto): Promise<PaginatedResponseDto<PatioDto>> {
    return this.patiosService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a patio by ID' })
  @ApiOkResponse({
    description: 'Patio details',
    type: PatioDto,
  })
  @ApiNotFoundResponse({ description: 'Patio not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<PatioDto> {
    try {
      return await this.patiosService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Patio with ID ${id} not found`);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a patio' })
  @ApiOkResponse({
    description: 'Patio updated successfully',
    type: PatioDto,
  })
  @ApiNotFoundResponse({ description: 'Patio not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdatePatioDto): Promise<PatioDto> {
    return this.patiosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a patio' })
  @ApiNoContentResponse({ description: 'Patio deleted successfully' })
  @ApiNotFoundResponse({ description: 'Patio not found' })
  @ApiConflictResponse({ description: 'Cannot delete patio with machines assigned to it' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.patiosService.delete(id);
  }

  @Get(':id/machines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get machines in a patio' })
  @ApiOkResponse({
    description: 'List of machines in the patio',
    type: PaginatedResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Patio not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findMachinesInPatio(
    @Param('id') id: string,
    @Query() query: MachinesInPatioQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.patiosService.findMachinesInPatio(id, query);
  }
}
