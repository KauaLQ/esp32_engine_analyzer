import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './api/auth.controller';
import { AuthService } from './domain/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './domain/strategies/jwt.strategy';
import { RolesGuard } from './domain/guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET não definido');

        const expiresInSeconds = Number(
          configService.get<string>('JWT_EXPIRES_IN_SECONDS', '900'),
        );
        if (!Number.isFinite(expiresInSeconds)) {
          throw new Error('JWT_EXPIRES_IN_SECONDS inválido (use número em segundos, ex: 900)');
        }

        return {
          secret,
          signOptions: { expiresIn: expiresInSeconds },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtStrategy, RolesGuard],
})
export class AuthModule {}
