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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_repository_1 = require("../repositories/auth.repository");
const prisma_types_1 = require("../../../prisma/prisma.types");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    authRepository;
    jwtService;
    configService;
    constructor(authRepository, jwtService, configService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, fullName, role } = registerDto;
        const existingUser = await this.authRepository.findUserByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const user = await this.authRepository.createUser(email, password, fullName, role);
        return this.generateTokensResponse(user);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === prisma_types_1.UserStatus.disabled) {
            throw new common_1.ForbiddenException('User account is disabled');
        }
        const isPasswordValid = await this.authRepository.validatePassword(user, password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.authRepository.updateUserLastLogin(user.id);
        return this.generateTokensResponse(user);
    }
    async refresh(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        const tokenRecord = await this.authRepository.findRefreshTokenByToken(refreshToken);
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = tokenRecord.users;
        if (user.status === prisma_types_1.UserStatus.disabled) {
            throw new common_1.ForbiddenException('User account is disabled');
        }
        const newRefreshToken = (0, uuid_1.v4)();
        const expiresInDays = this.configService.get('REFRESH_EXPIRES_DAYS', 7);
        const newTokenId = await this.authRepository.createRefreshToken(user.id, newRefreshToken, expiresInDays, tokenRecord.user_agent, tokenRecord.ip);
        await this.authRepository.revokeRefreshToken(tokenRecord.id, newTokenId);
        const accessToken = this.generateAccessToken(user);
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: this.mapUserToDto(user),
        };
    }
    async logout(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        const tokenRecord = await this.authRepository.findRefreshTokenByToken(refreshToken);
        if (tokenRecord) {
            await this.authRepository.revokeRefreshToken(tokenRecord.id);
        }
    }
    async getProfile(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.mapUserToDto(user);
    }
    generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const secret = this.configService.get('JWT_SECRET');
        if (!secret)
            throw new Error('JWT_SECRET não definido');
        const expiresInSeconds = Number(this.configService.get('JWT_EXPIRES_IN_SECONDS', '900'));
        if (!Number.isFinite(expiresInSeconds)) {
            throw new Error('JWT_EXPIRES_IN_SECONDS inválido');
        }
        return this.jwtService.sign(payload, {
            secret,
            expiresIn: expiresInSeconds,
        });
    }
    async generateTokensResponse(user) {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = (0, uuid_1.v4)();
        const expiresInDays = this.configService.get('REFRESH_EXPIRES_DAYS', 7);
        await this.authRepository.createRefreshToken(user.id, refreshToken, expiresInDays);
        return {
            accessToken,
            refreshToken,
            user: this.mapUserToDto(user),
        };
    }
    mapUserToDto(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name ?? "Não definido",
            role: user.role,
            status: user.status,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map