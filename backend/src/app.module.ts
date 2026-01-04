import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MachinesModule } from './modules/machines/machines.module';
import { PatiosModule } from './modules/patios/patios.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { EmissionsModule } from './modules/emissions/emissions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TelemetryModule,
    MachinesModule,
    PatiosModule,
    EmissionsModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
