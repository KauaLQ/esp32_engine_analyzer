import { Module, forwardRef } from '@nestjs/common';
import { EmissionsService } from './domain/emissions.service';
import { EmissionsRepository } from './repositories/emissions.repository';
import { EmissionsController } from './api/emissions.controller';
import { ThresholdsModule } from '../thresholds/thresholds.module';

@Module({
  imports: [
    forwardRef(() => ThresholdsModule),
  ],
  controllers: [EmissionsController],
  providers: [EmissionsService, EmissionsRepository],
  exports: [EmissionsService],
})
export class EmissionsModule {}
