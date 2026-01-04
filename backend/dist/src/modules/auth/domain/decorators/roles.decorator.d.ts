import { UserRole } from '../../../../prisma/prisma.types';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Array<UserRole | string>) => import("@nestjs/common").CustomDecorator<string>;
