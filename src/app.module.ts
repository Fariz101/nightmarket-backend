import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { PrismaModule } from './prisma/prisma.module';
import { BcryptService } from './bcrypt/bcrypt.service';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './user/user.module';
import { CustomerModule } from './customer/customer.module';
import { AdminModule } from './admin/admin.module';
import { SellerModule } from './seller/seller.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [PrismaModule, BcryptModule, AuthModule, CloudinaryModule, UserModule, CustomerModule, AdminModule, SellerModule, ProductModule, CartModule, TransactionModule],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, BcryptService, CloudinaryService],
})
export class AppModule { }
