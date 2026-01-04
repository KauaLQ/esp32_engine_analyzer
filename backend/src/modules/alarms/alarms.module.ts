// alarms.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AlarmsController } from './api/alarms.controller';
import { AlarmsService } from './domain/alarms.service';
import { AlarmsRepository } from './repositories/alarms.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AlarmsController],
  providers: [AlarmsService, AlarmsRepository],
  exports: [AlarmsService],
})
export class AlarmsModule {}
