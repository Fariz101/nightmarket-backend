import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  productId!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount!: number;
}