import { ApiProperty } from '@nestjs/swagger';

export class PatioPublicDto {
  @ApiProperty({
    description: 'The unique identifier of the patio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  patioId: string;

  @ApiProperty({
    description: 'The name of the patio',
    example: 'Pátio A',
  })
  name: string;

  @ApiProperty({
    description: 'The address of the patio',
    example: 'Rua X, 123',
    nullable: true,
  })
  address: string | null;
}
