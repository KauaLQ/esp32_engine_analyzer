import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ThresholdProfileDto {
  @ApiProperty({ description: 'Threshold profile ID' })
  id: string;

  @ApiProperty({ description: 'Machine ID' })
  machineId: string;

  @ApiProperty({ description: 'Threshold mode', enum: ['MANUAL', 'AI_N8N'] })
  mode: 'MANUAL' | 'AI_N8N';

  @ApiProperty({ description: 'Whether the profile is active' })
  active: boolean;

  @ApiProperty({ description: 'Profile version number' })
  version: number;

  @ApiProperty({ description: 'Threshold profile payload'})
  payload: Record<string, any>;

  @ApiPropertyOptional({ description: 'AI request data'})
  aiRequest?: Record<string, any>;

  @ApiPropertyOptional({ description: 'AI response data'})
  aiResponse?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
