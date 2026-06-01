import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '@prisma/client';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsEnum(Category)
  category!: Category;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  stock!: number;

  @IsOptional()
  photo?: any;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sellerId?: number;
}