"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma_types_1 = require("../../../prisma/prisma.types");
let AuthRepository = class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserByEmail(email) {
        const user = await this.prisma.users.findFirst({
            where: { email },
        });
        return this.toUserEntity(user);
    }
    async findUserById(id) {
        const user = await this.prisma.users.findUnique({
            where: { id },
        });
        return this.toUserEntity(user);
    }
    async createUser(email, password, fullName, role) {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.users.create({
            data: {
                email,
                password_hash: passwordHash,
                full_name: fullName,
                role: role ?? prisma_types_1.UserRole.operator,
                status: prisma_types_1.UserStatus.active,
            },
        });
        return this.toUserEntity(user);
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }
    async createRefreshToken(userId, token, expiresIn, userAgent, ip) {
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresIn);
        const refreshToken = await this.prisma.refresh_tokens.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                expires_at: expiresAt,
                user_agent: userAgent,
                ip,
            },
        });
        return refreshToken.id;
    }
    async findRefreshTokenByToken(token) {
        const tokenHash = this.hashToken(token);
        return this.prisma.refresh_tokens.findFirst({
            where: {
                token_hash: tokenHash,
                revoked_at: null,
                expires_at: {
                    gt: new Date(),
                },
            },
            include: {
                users: true,
            },
        });
    }
    async revokeRefreshToken(id, replacedById) {
        await this.prisma.refresh_tokens.update({
            where: { id },
            data: {
                revoked_at: new Date(),
                replaced_by_id: replacedById,
            },
        });
    }
    async updateUserLastLogin(userId) {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                last_login_at: new Date(),
            },
        });
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    toUserEntity(user) {
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            password_hash: user.password_hash,
            full_name: user.full_name,
            role: user.role,
            status: user.status,
            last_login_at: user.last_login_at,
            tenant_id: user.tenant_id ?? null,
        };
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map