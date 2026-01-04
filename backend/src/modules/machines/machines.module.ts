import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MachinesController } from './api/machines.controller';
import { MachinesService } from './domain/machines.service';
import { MachinesRepository } from './repositories/machines.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MachinesController],
  providers: [MachinesService, MachinesRepository],
  exports: [MachinesService],
})
export class MachinesModule {}
