import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductDto } from './dto/find-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

  async create(createProductDto: CreateProductDto, file: Express.Multer.File, user: { id: number; role: string }) {
    try {
      const { name, description, category, price, stock, sellerId } = createProductDto;
      let targetSellerId: number;

      if (user.role === 'ADMIN') {
        if (sellerId) {
          const sellerExists = await this.prisma.seller.findUnique({ where: { id: sellerId } });
          if (!sellerExists) return { 
            success: false, 
            message: 'Seller does not exist', 
            data: null };
          targetSellerId = sellerId;
        } else {
          const adminAsSeller = await this.prisma.seller.findFirst({ where: { userId: user.id } });
          if (!adminAsSeller) {
            return { 
              success: false, 
              message: 'Admin does not have a Seller profile. Please provide a target sellerId.', 
              data: null 
            };
          }
          targetSellerId = adminAsSeller.id;
        }
      } else if (user.role === 'SELLER') {
        const seller = await this.prisma.seller.findFirst({ where: { userId: user.id } });
        if (!seller) return { 
          success: false, 
          message: 'Your Seller profile not found', 
          data: null 
        };
        targetSellerId = seller.id;
      } else {
        return { 
          success: false, 
          message: 'Access denied', 
          data: null 
        };
      }

      let photoUrl = null;
      if (file) {
        const uploadResult = await this.cloudinary.uploadFile(file, 'product_photos');
        photoUrl = uploadResult.secure_url;
      }

      const product = await this.prisma.product.create({
        data: {
          name,
          description,
          category,
          price,
          stock,
          photo: photoUrl,
          sellerId: targetSellerId,
        },
      });

      return { 
        success: true, 
        message: 'Product created successfully', 
        data: product };
    } catch (error: any) {
      return { 
        success: false, 
        message: `error when create product: ${error.message}`, 
        data: null 
      };
    }
  }

  async findAll(findProductDto: FindProductDto) {
    try {
      const { search = '', category, page = 1, limit = 10, sortBy, sortOrder = 'asc' } = findProductDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) where.name = { contains: search };
      if (category) where.category = category

      const orderBy: any = sortBy
        ? { [sortBy]: sortOrder }
        : { id: 'asc' };

      const products = await this.prisma.product.findMany({
        where,
        orderBy,
        skip: skip,
        take: Number(limit),
        include: { seller: true }
      });

      const total = await this.prisma.product.count({ where });

      return {
        success: true,
        message: 'Product data found successfully',
        data: products,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: `error when finding products: ${error.message}`, 
        data: null 
      };
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: id },
        include: { seller: true }
      });
      if (!product) return { 
        success: false, 
        message: 'Product not found', 
        data: null 
      };
      return { 
        success: true, 
        message: 'Product details found', 
        data: product 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: `error when finding product: ${error.message}`, 
        data: null 
      };
    }
  }

  async findMyProducts(user: { id: number; role: string }) {
  try {
    const seller = await this.prisma.seller.findFirst({
      where: { userId: user.id },
    });

    if (!seller) {
      return { 
        success: false, 
        message: 'seller/admin profile not found', 
        data: null 
      };
    }

    const products = await this.prisma.product.findMany({
      where: { sellerId: seller.id },
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'your products data found successfully',
      data: products,
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: `error when finding your products: ${error.message}`, 
      data: null 
    };
  }
}

  async update(id: number, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    try {
      const { name, description, category, price, stock } = updateProductDto;

      const findProduct = await this.prisma.product.findUnique({ where: { id: id } });
      if (!findProduct) return { 
        success: false, 
        message: 'Product not found', 
        data: null 
      };

      let photoUrl = findProduct.photo;
      if (file) {
        if (findProduct.photo) await this.cloudinary.deleteFile(findProduct.photo);
        const uploadResult = await this.cloudinary.uploadFile(file, 'product_photos');
        photoUrl = uploadResult.secure_url;
      }

      const updateProduct = await this.prisma.product.update({
        where: { id: id },
        data: {
          name: name ?? findProduct.name,
          description: description ?? findProduct.description,
          category: category ?? findProduct.category,
          price: price ?? findProduct.price,
          stock: stock ?? findProduct.stock,
          photo: photoUrl
        }
      });
      return { success: true, message: 'Product updated successfully', data: updateProduct };
    } catch (error: any) {
      return { 
        success: false, 
        message: `error when updating product: ${error.message}`, 
        data: null 
      };
    }
  }

  async remove(id: number) {
    try {
      const findProduct = await this.prisma.product.findUnique({ where: { id: id } });
      if (!findProduct) return { 
        success: false, 
        message: 'Product not found', 
        data: null 
      };

      if (findProduct.photo) await this.cloudinary.deleteFile(findProduct.photo);

      await this.prisma.product.delete({ where: { id: id } });
      return { success: true, message: 'Product removed successfully', data: null };
    } catch (error: any) {
      return { 
        success: false, 
        message: `error when removing product: ${error.message}`, 
        data: null 
      };
    }
  }
}