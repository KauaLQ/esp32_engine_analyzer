import { PrismaService } from '../../../prisma/prisma.service';
import { UserEntity, UserRole } from '../../../prisma/prisma.types';
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUserByEmail(email: string): Promise<UserEntity | null>;
    findUserById(id: string): Promise<UserEntity | null>;
    createUser(email: string, password: string, fullName: string, role: UserRole): Promise<UserEntity>;
    validatePassword(user: UserEntity, password: string): Promise<boolean>;
    createRefreshToken(userId: string, token: string, expiresIn: number, userAgent?: string, ip?: string): Promise<string>;
    findRefreshTokenByToken(token: string): Promise<any | null>;
    revokeRefreshToken(id: string, replacedById?: string): Promise<void>;
    updateUserLastLogin(userId: string): Promise<void>;
    private hashToken;
    private toUserEntity;
}
