import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  private async getCustomerId(userId: number) {
    const customer = await this.prisma.customer.findFirst({ where: { userId } });
    if (!customer) throw new Error('customer profile not found');
    return customer.id;
  }

  async createCartItem(dto: CreateCartDto, userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);

      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product) return { success: false, message: 'Product not found', data: null };
      if (product.stock < dto.amount) return { success: false, message: 'Product stock is insufficient', data: null };

      const existingItem = await this.prisma.cartItem.findFirst({
        where: { customerId, productId: dto.productId }
      });

      let cartItem;
      if (existingItem) {
        cartItem = await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { amount: existingItem.amount + dto.amount }
        });
      } else {
        cartItem = await this.prisma.cartItem.create({
          data: { customerId, productId: dto.productId, amount: dto.amount }
        });
      }

      return { success: true, message: 'Product added to cart successfully', data: cartItem };
    } catch (error: any) {
      return { success: false, message: `error when adding product to cart: ${error.message}`, data: null };
    }
  }

  async getMyCart(userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);
      const items = await this.prisma.cartItem.findMany({
        where: { customerId },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, message: 'Your shopping cart', data: items };
    } catch (error: any) {
      return { success: false, message: `error when fetching your cart: ${error.message}`, data: null };
    }
  }

  async updateCartItem(id: number, dto: UpdateCartDto, userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);
      const existingItem = await this.prisma.cartItem.findFirst({ where: { id, customerId } });

      if (!existingItem) return { success: false, message: 'Item not found in cart', data: null };

      const updated = await this.prisma.cartItem.update({
        where: { id },
        data: { amount: dto.amount }
      });
      return { success: true, message: 'Product quantity updated', data: updated };
    } catch (error: any) {
      return { success: false, message: `error when updating cart item: ${error.message}`, data: null };
    }
  }

  async removeCartItem(id: number, userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);
      const existingItem = await this.prisma.cartItem.findFirst({ where: { id, customerId } });

      if (!existingItem) return { success: false, message: 'Item not found in cart', data: null };

      await this.prisma.cartItem.delete({ where: { id } });
      return { success: true, message: 'Product removed from cart', data: null };
    } catch (error: any) {
      return { success: false, message: `error when removing item from cart: ${error.message}`, data: null };
    }
  }
}