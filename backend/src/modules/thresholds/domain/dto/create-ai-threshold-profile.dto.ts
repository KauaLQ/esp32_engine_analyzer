import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiThresholdProfileDto {
  @ApiProperty({
    description: 'Machine manufacturer',
    example: 'WEG'
  })
  @IsNotEmpty()
  @IsString()
  manufacturer: string;

  @ApiProperty({
    description: 'Machine model',
    example: 'W22 Trifásico'
  })
  @IsNotEmpty()
  @IsString()
  model: string;
}
