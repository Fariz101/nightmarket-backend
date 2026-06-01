import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UsePipes, 
  ValidationPipe, 
  UseGuards, 
  Query, 
  Patch, 
  UseInterceptors, 
  UploadedFile,     
  Req
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { RoleGuard, Roles } from '../helper/roles-guard';
import { AuthGuard } from '@nestjs/passport';
import { FindSellerDto } from './dto/find-seller.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createSellerDto: CreateSellerDto,
    @UploadedFile() file: Express.Multer.File, 
  ) {
    return this.sellerService.create(createSellerDto, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  findAll(@Query() findSellerDto: FindSellerDto) {
    return this.sellerService.findAll(findSellerDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('SELLER')
    async getMe(@Req() req: any) {
      return this.sellerService.getMe(req.user.id);
    }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.sellerService.findOne(+id); 
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('photo')) 
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string, 
    @Body() updateSellerDto: UpdateSellerDto,
    @UploadedFile() file?: Express.Multer.File, 
  ) {
    return this.sellerService.update(+id, updateSellerDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.sellerService.remove(+id);
  }
}