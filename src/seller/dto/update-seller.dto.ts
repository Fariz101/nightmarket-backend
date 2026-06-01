import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerDto } from './create-seller.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSellerDto extends PartialType(CreateSellerDto) {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  photo?: any;
}
