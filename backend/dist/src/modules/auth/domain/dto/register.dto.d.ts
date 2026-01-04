import { UserRole } from '../../../../prisma/prisma.types';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}
