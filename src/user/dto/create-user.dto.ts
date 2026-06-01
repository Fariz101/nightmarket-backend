import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsEmail()
  username!: string;
  
  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;
}
