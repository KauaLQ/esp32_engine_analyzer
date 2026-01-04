import { PatiosService } from '../domain/patios.service';
import { CreatePatioDto, MachinesInPatioQueryDto, PaginatedResponseDto, PatioDto, PatioPublicDto, PatioQueryDto, UpdatePatioDto } from '../domain/dto';
export declare class PatiosController {
    private readonly patiosService;
    constructor(patiosService: PatiosService);
    findPublic(): Promise<PatioPublicDto[]>;
    create(dto: CreatePatioDto): Promise<PatioDto>;
    findAll(query: PatioQueryDto): Promise<PaginatedResponseDto<PatioDto>>;
    findOne(id: string): Promise<PatioDto>;
    update(id: string, dto: UpdatePatioDto): Promise<PatioDto>;
    delete(id: string): Promise<void>;
    findMachinesInPatio(id: string, query: MachinesInPatioQueryDto): Promise<PaginatedResponseDto<any>>;
}
