import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from '../helper/roles-guard';

@Controller('cart')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles('CUSTOMER')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  createCartItem(@Body() createCartDto: CreateCartDto, @Req() req: any) {
    return this.cartService.createCartItem(createCartDto, req.user.id);
  }

  @Get()
  getMyCart(@Req() req: any) {
    return this.cartService.getMyCart(req.user.id);
  }

  @Patch(':id')
  updateCartItem(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto, @Req() req: any) {
    return this.cartService.updateCartItem(+id, updateCartDto, req.user.id);
  }

  @Delete(':id')
  removeCartItem(@Param('id') id: string, @Req() req: any) {
    return this.cartService.removeCartItem(+id, req.user.id);
  }
}