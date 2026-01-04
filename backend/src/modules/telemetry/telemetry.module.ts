// telemetry.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MachinesModule } from '../machines/machines.module';
import { ThresholdsModule } from '../thresholds/thresholds.module';
import { AlarmsModule } from '../alarms/alarms.module';
import { EmissionsModule } from '../emissions/emissions.module';

import { TelemetryController } from './api/telemetry.controller';
import { TelemetryService } from './domain/telemetry.service';
import { TelemetryRepository } from './repositories/telemetry.repository';

import { AlarmsEvaluatorService } from '../alarms/domain/alarms-evaluator.service';

@Module({
  imports: [
    PrismaModule, 
    MachinesModule, 
    ThresholdsModule, 
    AlarmsModule,
    forwardRef(() => EmissionsModule),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService, TelemetryRepository, AlarmsEvaluatorService],
})
export class TelemetryModule {}
