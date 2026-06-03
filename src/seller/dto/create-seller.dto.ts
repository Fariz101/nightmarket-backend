import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Min,
} from 'class-validator';

export class CreateSellerDto {
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

  @IsNotEmpty()
  @IsString()
  owner!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsOptional()
  photo?: any;
}
