import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../../../prisma/prisma.types';

export class UserDto {
  @ApiProperty({
    example: '8b70dbcc-5c12-4bf0-a10d-e4e4ef8a2d7e',
    description: 'The ID of the user',
  })
  id: string;

  @ApiProperty({
    example: 'rotorial@admin.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'Admin User',
    description: 'The full name of the user',
  })
  fullName: string;

  @ApiProperty({
    example: 'admin',
    description: 'The role of the user',
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    example: 'active',
    description: 'The status of the user',
    enum: UserStatus,
  })
  status: UserStatus;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'The user information',
    type: UserDto,
  })
  user: UserDto;
}
