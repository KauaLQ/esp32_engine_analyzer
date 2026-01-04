import { UserRole, UserStatus } from '../../../../prisma/prisma.types';
export declare class UserDto {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}
