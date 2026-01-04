import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { UserEntity, UserStatus } from '../../../prisma/prisma.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, fullName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create user
    const user = await this.authRepository.createUser(
      email,
      password,
      fullName,
      role,
    );

    // Generate tokens
    return this.generateTokensResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status === UserStatus.disabled) {
      throw new ForbiddenException('User account is disabled');
    }

    // Validate password
    const isPasswordValid = await this.authRepository.validatePassword(
      user,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.authRepository.updateUserLastLogin(user.id);

    // Generate tokens
    return this.generateTokensResponse(user);
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token
    const tokenRecord = await this.authRepository.findRefreshTokenByToken(refreshToken);
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = tokenRecord.users;

    // Check if user is active
    if (user.status === UserStatus.disabled) {
      throw new ForbiddenException('User account is disabled');
    }

    // Revoke the current refresh token and create a new one (token rotation)
    const newRefreshToken = uuidv4();
    const expiresInDays = this.configService.get<number>('REFRESH_EXPIRES_DAYS', 7);
    const newTokenId = await this.authRepository.createRefreshToken(
      user.id,
      newRefreshToken,
      expiresInDays,
      tokenRecord.user_agent,
      tokenRecord.ip,
    );

    // Revoke old token and link to new one
    await this.authRepository.revokeRefreshToken(tokenRecord.id, newTokenId);

    // Generate access token
    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: this.mapUserToDto(user),
    };
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token
    const tokenRecord = await this.authRepository.findRefreshTokenByToken(refreshToken);
    if (tokenRecord) {
      // Revoke the refresh token
      await this.authRepository.revokeRefreshToken(tokenRecord.id);
    }
  }

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.mapUserToDto(user);
  }

  private generateAccessToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET não definido');

    const expiresInSeconds = Number(
      this.configService.get<string>('JWT_EXPIRES_IN_SECONDS', '900'),
    );
    if (!Number.isFinite(expiresInSeconds)) {
      throw new Error('JWT_EXPIRES_IN_SECONDS inválido');
    }

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresInSeconds, // ✅ number
    });
  }

  private async generateTokensResponse(user: UserEntity): Promise<AuthResponseDto> {
    // Generate access token
    const accessToken = this.generateAccessToken(user);

    // Generate refresh token
    const refreshToken = uuidv4();
    const expiresInDays = this.configService.get<number>('REFRESH_EXPIRES_DAYS', 7);
    await this.authRepository.createRefreshToken(
      user.id,
      refreshToken,
      expiresInDays,
    );

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToDto(user),
    };
  }

  private mapUserToDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name ?? "Não definido",
      role: user.role,
      status: user.status,
    };
  }
}
