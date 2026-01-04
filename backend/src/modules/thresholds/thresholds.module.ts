import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ThresholdsController } from './api/thresholds.controller';
import { ThresholdsService } from './domain/thresholds.service';
import { ThresholdsRepository } from './repositories/thresholds.repository';
import { N8nClient } from './infra/n8n.client';
import { ThresholdEvaluationService } from './domain/threshold-evaluation.service';
import { AlarmsModule } from '../alarms/alarms.module';

@Module({
  imports: [PrismaModule, AlarmsModule],
  controllers: [ThresholdsController],
  providers: [
    ThresholdsService,
    ThresholdsRepository,
    N8nClient,
    ThresholdEvaluationService,
  ],
  exports: [
    ThresholdsService,
    ThresholdEvaluationService,
    ThresholdsRepository, // ✅ IMPORTANTE
  ],
})
export class ThresholdsModule {}
