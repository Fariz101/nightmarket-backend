import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { FindAdminDto } from './dto/find-admin.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Injeksi Cloudinary

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private readonly bcrypt: BcryptService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async create(createAdminDto: CreateAdminDto, file?: Express.Multer.File) {
    try {
      const { name, username, email, password } = createAdminDto;

      let photoUrl = null;
      if (file) {
        const uploadResult = await this.cloudinary.uploadFile(file, 'admin_photos');
        photoUrl = uploadResult.secure_url;
      }

      const createAdmin = await this.prisma.admin.create({
        data: {
          name: name,
          photo: photoUrl,
          user: {
            create: {
              username: username,
              email: email,
              password: await this.bcrypt.hashPassword(password),
              role: 'ADMIN',
            },
          },
        },
        include: {
          user: true,
        },
      });

      return {
        success: true,
        message: 'admin created successfully',
        data: createAdmin,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when create admin: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(findAdminDto: FindAdminDto) {
    try {
      const { search = '', page = 1, limit = 10, sortBy, sortOrder = 'asc' } = findAdminDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { user: { email: { contains: search } } },
          { user: { username: { contains: search } } }
        ];
      }

      const orderBy: any = sortBy ? { [sortBy]: sortOrder } : { id: 'asc' };

      const admin = await this.prisma.admin.findMany({
        where,
        orderBy,
        skip: skip,
        take: Number(limit),
        include: {
          user: true,
        },
      });
      const total = await this.prisma.admin.count({ where });

      return {
        success: true,
        message: 'admin data founded successfully',
        data: admin,
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
        message: `error when get admin: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: number) {
    try {
      const admin = await this.prisma.admin.findFirst({
        where: { id: id },
        include: {
          user: true,
        },
      });
      if (!admin) {
        return {
          success: false,
          message: 'Admin does not exists',
          data: null,
        };
      }
      return {
        success: true,
        message: 'admin data founded successfully',
        data: admin,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when get admin: ${error.message}`,
        data: null,
      };
    }
  }

  async getMe(userId: number) {
    try {
      const adminProfile = await this.prisma.admin.findFirst({
        where: { userId: userId },
        include: { user: true },
      });

      if (!adminProfile) {
        return {
          success: false,
          message: 'Admin profile not found',
          data: null
        };
      }

      if (adminProfile.user) {
        delete (adminProfile.user as any).password;
      }

      return {
        success: true,
        message: 'your admin profile founded successfully',
        data: adminProfile
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when get your admin profile: ${error.message}`,
        data: null
      };
    }
  }

  async update(id: number, updateAdminDto: UpdateAdminDto, file?: Express.Multer.File) {
    try {
      const { name, username, email, password } = updateAdminDto;

      const findAdmin = await this.prisma.admin.findFirst({
        where: { id: id },
      });
      if (!findAdmin) {
        return {
          success: false,
          message: 'Admin does not exists',
          data: null,
        };
      }

      let photoUrl = findAdmin.photo;

      if (file) {
        if (findAdmin.photo) await this.cloudinary.deleteFile(findAdmin.photo);
        const uploadResult = await this.cloudinary.uploadFile(file, 'admin_photos');
        photoUrl = uploadResult.secure_url;
      }

      const userUpdateData: any = {};
      if (username) userUpdateData.username = username;
      if (email) userUpdateData.email = email;
      if (password) userUpdateData.password = await this.bcrypt.hashPassword(password);

      const updateAdmin = await this.prisma.admin.update({
        where: { id: id },
        data: {
          name: name ?? findAdmin.name,
          photo: photoUrl,
          user: Object.keys(userUpdateData).length > 0 ? { update: userUpdateData } : undefined,
        },
        include: {
          user: true,
        },
      });

      return {
        success: true,
        message: 'New Admin has updated',
        data: updateAdmin,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when update admin: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: number) {
    try {
      const findAdmin = await this.prisma.admin.findFirst({
        where: { id: id },
      });
      if (!findAdmin) {
        return {
          success: false,
          message: 'Admin does not exists',
          data: null,
        };
      }

      if (findAdmin.photo) {
        try {
          await this.cloudinary.deleteFile(findAdmin.photo);
        } catch (deleteError) {
          console.log('Gagal menghapus foto admin di Cloudinary', deleteError);
        }
      }

      const deletedAdmin = await this.prisma.admin.delete({
        where: { id: id },
        include: {
          user: true,
        },
      });
      return {
        success: true,
        message: 'admin has deleted',
        data: deletedAdmin,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when delete admin : ${error.message}`,
        data: null,
      };
    }
  }
}