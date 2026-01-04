import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePatioDto {
  @ApiPropertyOptional({
    description: 'The name of the patio',
    example: 'Pátio A',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({
    description: 'The address of the patio',
    example: 'Rua X, 123',
    maxLength: 200,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string | null;
}
