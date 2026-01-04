import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateManualThresholdProfileDto {
  @ApiProperty({
    additionalProperties: true,
    description: 'Threshold profile payload',
    type: 'object',
    example: {
      regime: {},
      nominais: {},
      thresholds: {
        voltage: {
          warn_low_v: 414,
          crit_low_v: 391,
          warn_high_v: 506,
          crit_high_v: 531,
          hard_min_v: 391,
          hard_max_v: 531
        },
        current: {
          warn_high_a: 6.82,
          crit_high_a: 7.75,
          hard_max_a: 8.37
        },
        temperature_tcase: {
          warn_high_c: 100,
          crit_high_c: 110,
          hard_max_c: 120
        }
      }
    }
  })
  @IsNotEmpty()
  @IsObject()
  payload: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Optional notes about the threshold profile',
    type: [String],
    example: ['Manual threshold profile created by admin']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];
}
