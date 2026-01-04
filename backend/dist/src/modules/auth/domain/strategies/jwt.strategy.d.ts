import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthRepository } from '../../repositories/auth.repository';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly authRepository;
    constructor(configService: ConfigService, authRepository: AuthRepository);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: import("../../../../prisma/prisma.types").UserRole;
        tenantId: string | null | undefined;
    }>;
}
export {};
