import { MachinesRepository } from '../repositories/machines.repository';
import { ProvisionRequestDto } from './dto/provision-request.dto';
import { MachineDto, MachineDetailDto } from './dto/machine.dto';
import { MachineQueryDto } from './dto/machine-query.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { ProvisionResponseDto } from './dto/provision-response.dto';
export declare class MachinesService {
    private readonly machinesRepository;
    constructor(machinesRepository: MachinesRepository);
    provision(dto: ProvisionRequestDto): Promise<ProvisionResponseDto>;
    findAll(query: MachineQueryDto): Promise<PaginatedResponseDto<MachineDto>>;
    findOne(id: string): Promise<MachineDetailDto>;
    update(id: string, dto: UpdateMachineDto): Promise<MachineDto>;
    updateDeviceLastSeen(machineId: string): Promise<void>;
    delete(id: string): Promise<boolean>;
}
