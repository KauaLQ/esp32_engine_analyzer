import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../../prisma/prisma.types';

export class RegisterDto {
  @ApiProperty({
    example: 'user@rotorial.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SenhaForte123',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Usuário Rotorial',
    description: 'The full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'operator',
    description: 'The role of the user',
    enum: UserRole,
    default: UserRole.operator,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
