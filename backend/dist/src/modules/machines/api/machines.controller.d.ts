import { MachinesService } from '../domain/machines.service';
import { ProvisionRequestDto } from '../domain/dto/provision-request.dto';
import { ProvisionResponseDto } from '../domain/dto/provision-response.dto';
import { MachineDto, MachineDetailDto } from '../domain/dto/machine.dto';
import { MachineQueryDto } from '../domain/dto/machine-query.dto';
import { UpdateMachineDto } from '../domain/dto/update-machine.dto';
import { PaginatedResponseDto } from '../domain/dto/paginated-response.dto';
import { ConfigService } from '@nestjs/config';
export declare class MachinesController {
    private readonly machinesService;
    private readonly configService;
    constructor(machinesService: MachinesService, configService: ConfigService);
    provision(provisionToken: string, dto: ProvisionRequestDto): Promise<ProvisionResponseDto>;
    findAll(query: MachineQueryDto): Promise<PaginatedResponseDto<MachineDto>>;
    findOne(id: string): Promise<MachineDetailDto>;
    update(id: string, dto: UpdateMachineDto): Promise<MachineDto>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
