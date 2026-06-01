import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { FindSellerDto } from './dto/find-seller.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Injeksi Cloudinary

@Injectable()
export class SellerService {
  constructor(
    private prisma: PrismaService,
    private readonly bcrypt: BcryptService,
    private readonly cloudinary: CloudinaryService, 
  ) {}

  async create(createSellerDto: CreateSellerDto, file?: Express.Multer.File) {
    try {
      const { name, owner, phone, address, username, email, password } = createSellerDto;

      let photoUrl = null;
      if (file) {
        const uploadResult = await this.cloudinary.uploadFile(file, 'seller_photos');
        photoUrl = uploadResult.secure_url;
      }

      const createSeller = await this.prisma.seller.create({
        data: {
          name: name,
          owner: owner,
          phone: phone,
          address: address,
          photo: photoUrl,
          user: {
            create: {
              username: username,
              email: email,
              password: await this.bcrypt.hashPassword(password), 
              role: 'SELLER',     
            },
          },
        },
        include: {
          user: true, 
        },
      });

      return {
        success: true,
        message: 'seller created successfully',
        data: createSeller,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when create seller: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(findSellerDto: FindSellerDto) {
    try {
      const { search = '', page = 1, limit = 10, sortBy, sortOrder = 'asc' } = findSellerDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { owner: { contains: search } },
          { user: { email: { contains: search } } },
          { user: { username: { contains: search } } }
        ];
      }

      const orderBy: any = sortBy ? { [sortBy]: sortOrder } : { id: 'asc' };

      const seller = await this.prisma.seller.findMany({
        where,
        orderBy,
        skip: skip,
        take: Number(limit),
        include: {
          user: true, 
        },
      });
      const total = await this.prisma.seller.count({ where });

      return {
        success: true,
        message: 'seller data founded successfully',
        data: seller,
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
        message: `error when get seller: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: number) {
    try {
      const seller = await this.prisma.seller.findFirst({
        where: { id: id },
        include: {
          user: true, 
        },
      });
      if (!seller) {
        return {
          success: false,
          message: 'Seller does not exists',
          data: null,
        };
      }
      return {
        success: true,
        message: 'seller data founded successfully',
        data: seller,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when get seller: ${error.message}`,
        data: null,
      };
    }
  }

  async getMe(userId: number) {
  try {
    const sellerProfile = await this.prisma.seller.findFirst({
      where: { userId: userId },
      include: { user: true },  
    });

    if (!sellerProfile) {
      return { 
        success: false, 
        message: 'Seller profile not found', 
        data: null };
    }

    if (sellerProfile.user) {
      delete (sellerProfile.user as any).password;
    }

    return { 
      success: true, 
      message: 'your seller profile founded successfully', 
      data: sellerProfile };
  } catch (error: any) {
    return { 
      success: false, 
      message: `error when get your seller profile: ${error.message}`, 
      data: null };
  }
}

  async update(id: number, updateSellerDto: UpdateSellerDto, file?: Express.Multer.File) {
    try {
      const { name, owner, phone, address, username, email, password } = updateSellerDto;
      
      const findSeller = await this.prisma.seller.findFirst({
        where: { id: id },
      });
      if (!findSeller) {
        return {
          success: false,
          message: 'Seller does not exists',
          data: null,
        };
      }

      let photoUrl = findSeller.photo;

      if (file) {
        if (findSeller.photo) {
          try {
            await this.cloudinary.deleteFile(findSeller.photo);
          } catch (deleteError) {
            console.log('Gagal menghapus foto lama di Cloudinary', deleteError);
          }
        }
        const uploadResult = await this.cloudinary.uploadFile(file, 'seller_photos');
        photoUrl = uploadResult.secure_url;
      }

      const userUpdateData: any = {};
      if (username) userUpdateData.username = username;
      if (email) userUpdateData.email = email;
      if (password) userUpdateData.password = await this.bcrypt.hashPassword(password);

      const updateSeller = await this.prisma.seller.update({
        where: { id: id },
        data: {
          name: name ?? findSeller.name,
          owner: owner ?? findSeller.owner,
          phone: phone ?? findSeller.phone,
          address: address ?? findSeller.address,
          photo: photoUrl,
          user: Object.keys(userUpdateData).length > 0 ? { update: userUpdateData } : undefined,
        },
        include: {
          user: true, 
        },
      });

      return {
        success: true,
        message: 'New Seller has updated',
        data: updateSeller,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when update seller: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: number) {
    try {
      const findSeller = await this.prisma.seller.findFirst({
        where: { id: id },
      });
      if (!findSeller) {
        return {
          success: false,
          message: 'Seller does not exists',
          data: null,
        };
      }

      if (findSeller.photo) {
        try {
          await this.cloudinary.deleteFile(findSeller.photo);
        } catch (deleteError) {
          console.log('Gagal menghapus foto seller di Cloudinary', deleteError);
        }
      }

      const deletedSeller = await this.prisma.seller.delete({
        where: { id: id },
        include: {
          user: true, 
        },
      });
      return {
        success: true,
        message: 'seller has deleted',
        data: deletedSeller,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when delete seller : ${error.message}`,
        data: null,
      };
    }
  }
}