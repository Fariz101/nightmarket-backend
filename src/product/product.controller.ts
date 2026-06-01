import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductDto } from './dto/find-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from '../helper/roles-guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('SELLER', 'ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    return this.productService.create(createProductDto, file, req.user);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: FindProductDto) {
    return this.productService.findAll(query);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('SELLER', 'ADMIN')
  findMyProducts(@Req() req: any) {
    return this.productService.findMyProducts(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('SELLER', 'ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productService.update(+id, updateProductDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('SELLER', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}