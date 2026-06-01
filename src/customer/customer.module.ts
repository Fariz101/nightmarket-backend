import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CloudinaryModule,BcryptModule], 
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
