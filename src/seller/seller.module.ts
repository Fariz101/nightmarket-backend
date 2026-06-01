import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CloudinaryModule,BcryptModule], 
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
