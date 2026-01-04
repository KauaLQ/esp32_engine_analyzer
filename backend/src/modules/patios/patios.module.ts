import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PatiosController } from './api/patios.controller';
import { PatiosService } from './domain/patios.service';
import { PatiosRepository } from './repositories/patios.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatiosController],
  providers: [PatiosService, PatiosRepository],
  exports: [PatiosService],
})
export class PatiosModule {}
