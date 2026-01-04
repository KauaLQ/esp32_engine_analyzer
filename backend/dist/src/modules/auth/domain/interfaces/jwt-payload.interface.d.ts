import { UserRole } from '../../../../prisma/prisma.types';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}
