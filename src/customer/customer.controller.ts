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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RoleGuard, Roles } from '../helper/roles-guard';
import { AuthGuard } from '@nestjs/passport';
import { FindCustomerDto } from './dto/find-customer.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @UploadedFile() file: Express.Multer.File, 
  ) {
    return this.customerService.create(createCustomerDto, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  findAll(@Query() findCustomerDto: FindCustomerDto) {
    return this.customerService.findAll(findCustomerDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('CUSTOMER')
  async getMe(@Req() req: any) {
    return this.customerService.getMe(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id); 
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('photo')) 
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string, 
    @Body() updateCustomerDto: UpdateCustomerDto,
    @UploadedFile() file?: Express.Multer.File, 
  ) {
    return this.customerService.update(+id, updateCustomerDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}