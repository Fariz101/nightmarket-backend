import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category } from '.prisma/client/wasm';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
    
      @IsOptional()
      @IsEnum(Category)
      category?: Category;
    
      @IsOptional()
      @Type(() => Number)
      @IsNumber()
      price?: number;
    
      @IsOptional()
      @Type(() => Number)
      @IsNumber()
      stock?: number;
    
      @IsOptional()
      photo?: any;

      @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sellerId?: number;
}
