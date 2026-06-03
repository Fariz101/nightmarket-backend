import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  private async getCustomerId(userId: number) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new Error('customer profile not found');
    return customer.id;
  }

  async checkout(userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);

      const cartItems = await this.prisma.cartItem.findMany({
        where: { customerId },
        include: { product: true }
      });

      if (cartItems.length === 0) return { success: false, message: 'Cart is empty', data: null };

      let totalPrice = 0;
      for (const item of cartItems) {
        if (item.product.stock < item.amount) {
          return { success: false, message: `Product stock [${item.product.name}] is insufficient`, data: null };
        }
        totalPrice += item.product.price * item.amount;
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            customerId,
            totalPrice,
            status: 'PENDING'
          }
        });

        for (const item of cartItems) {
          await tx.transactionItem.create({
            data: {
              transactionId: transaction.id,
              productId: item.productId,
              amount: item.amount,
              price: item.product.price
            }
          });

          await tx.product.update({
            where: { id: item.productId },
            data: { 
              stock: item.product.stock - item.amount,
              sold: item.product.sold + item.amount 
            }
          });
        }

        await tx.cartItem.deleteMany({ where: { customerId } });

        return transaction;
      });

      return { success: true, message: 'Checkout successful', data: result };
    } catch (error: any) {
      return { success: false, message: `error during checkout: ${error.message}`, data: null };
    }
  }

  async uploadPaymentProof(id: number, file: Express.Multer.File, userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);
      const transaction = await this.prisma.transaction.findFirst({ where: { id, customerId } });

      if (!transaction) return { success: false, message: 'Transaksi tidak ditemukan', data: null };
      if (!file) return { success: false, message: 'File wajib diunggah', data: null };

      if (transaction.paymentProof) await this.cloudinary.deleteFile(transaction.paymentProof);
      
      const uploadResult = await this.cloudinary.uploadFile(file, 'payment_proofs');

      const updated = await this.prisma.transaction.update({
        where: { id },
        data: { paymentProof: uploadResult.secure_url }
      });

      return { success: true, message: 'Bukti pembayaran berhasil diunggah', data: updated };
    } catch (error: any) {
      return { success: false, message: error.message, data: null };
    }
  }

  async getMyHistory(userId: number) {
    try {
      const customerId = await this.getCustomerId(userId);
      const transactions = await this.prisma.transaction.findMany({
        where: { customerId },
        include: { transactionItems: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, message: 'Riwayat transaksi Anda', data: transactions };
    } catch (error: any) {
      return { success: false, message: error.message, data: null };
    }
  }

  async getAllTransactions() {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: { customer: true, transactionItems: {
            include: {
              product: true
         }} },
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, message: 'Semua transaksi', data: transactions };
    } catch (error: any) {
      return { success: false, message: error.message, data: null };
    }
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    try {
      const updated = await this.prisma.transaction.update({
        where: { id },
        data: { status: dto.status }
      });
      return { success: true, message: `Status berhasil diubah menjadi ${dto.status}`, data: updated };
    } catch (error: any) {
      return { success: false, message: error.message, data: null };
    }
  }
}