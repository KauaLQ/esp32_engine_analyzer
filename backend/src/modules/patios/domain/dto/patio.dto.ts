import { ApiProperty } from '@nestjs/swagger';

export class PatioDto {
  @ApiProperty({
    description: 'The unique identifier of the patio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

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

  @ApiProperty({
    description: 'The date and time when the patio was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the patio was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
