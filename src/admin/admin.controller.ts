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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { RoleGuard, Roles } from '../helper/roles-guard';
import { AuthGuard } from '@nestjs/passport';
import { FindAdminDto } from './dto/find-admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminService.create(createAdminDto, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  findAll(@Query() findAdminDto: FindAdminDto) {
    return this.adminService.findAll(findAdminDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  async getMe(@Req() req: any) {
    return this.adminService.getMe(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }
  
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.adminService.update(+id, updateAdminDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}