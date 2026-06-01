import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { BcryptModule } from '../bcrypt/bcrypt.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [BcryptModule], 
  controllers: [UserController],
  providers: [UserService, BcryptService],
})
export class UserModule {}
