import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Min
} from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Min(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  photo?: any;
}
