import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserEntity, UserRole, UserStatus } from '../../../prisma/prisma.types';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findFirst({
      where: { email },
    });

    return this.toUserEntity(user);
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    return this.toUserEntity(user);
  }

  async createUser(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role: role ?? UserRole.operator,
        status: UserStatus.active,
      },
    });

    return this.toUserEntity(user) as UserEntity;
  }

  async validatePassword(
    user: UserEntity,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async createRefreshToken(
    userId: string,
    token: string,
    expiresIn: number,
    userAgent?: string,
    ip?: string,
  ): Promise<string> {
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

  async findRefreshTokenByToken(token: string): Promise<any | null> {
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

  async revokeRefreshToken(id: string, replacedById?: string): Promise<void> {
    await this.prisma.refresh_tokens.update({
      where: { id },
      data: {
        revoked_at: new Date(),
        replaced_by_id: replacedById,
      },
    });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        last_login_at: new Date(),
      },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private toUserEntity(user: any): UserEntity | null {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      full_name: user.full_name,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      last_login_at: user.last_login_at,
      tenant_id: user.tenant_id ?? null,
    };
  }
}
