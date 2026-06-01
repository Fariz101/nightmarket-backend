import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

import { BcryptModule } from '../bcrypt/bcrypt.module'; 
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CloudinaryModule,BcryptModule],   
  controllers: [AdminController],
  providers: [AdminService], 
})
export class AdminModule {}