import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
