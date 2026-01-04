import { PatiosRepository } from '../repositories/patios.repository';
import { CreatePatioDto, MachinesInPatioQueryDto, PaginatedResponseDto, PatioDto, PatioPublicDto, PatioQueryDto, UpdatePatioDto } from './dto';
export declare class PatiosService {
    private readonly patiosRepository;
    constructor(patiosRepository: PatiosRepository);
    create(dto: CreatePatioDto): Promise<PatioDto>;
    findAll(query: PatioQueryDto): Promise<PaginatedResponseDto<PatioDto>>;
    findPublic(): Promise<PatioPublicDto[]>;
    findOne(id: string): Promise<PatioDto>;
    update(id: string, dto: UpdatePatioDto): Promise<PatioDto>;
    delete(id: string): Promise<void>;
    findMachinesInPatio(patioId: string, query: MachinesInPatioQueryDto): Promise<PaginatedResponseDto<any>>;
}
