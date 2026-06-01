import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { FindCustomerDto } from './dto/find-customer.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Injeksi Cloudinary

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private readonly bcrypt: BcryptService,
    private readonly cloudinary: CloudinaryService, 
  ) {}

  async create(createCustomerDto: CreateCustomerDto, file?: Express.Multer.File) {
    try {
      const { name, phone, address, username, email, password } = createCustomerDto;

      let photoUrl = null;
      if (file) {
        const uploadResult = await this.cloudinary.uploadFile(file, 'customer_photos');
        photoUrl = uploadResult.secure_url;
      }

      const createCustomer = await this.prisma.customer.create({
        data: {
          name: name,
          phone: phone,
          address: address,
          photo: photoUrl,
          user: {
            create: {
              username: username,
              email: email,
              password: await this.bcrypt.hashPassword(password), 
              role: 'CUSTOMER',     
            },
          },
        },
        include: {
          user: true, 
        },
      });

      return {
        success: true,
        message: 'customer created successfully',
        data: createCustomer,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when create customer: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(findCustomerDto: FindCustomerDto) {
    try {
      const { search = '', page = 1, limit = 10, sortBy, sortOrder = 'asc' } = findCustomerDto;
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

      const customer = await this.prisma.customer.findMany({
        where,
        orderBy,
        skip: skip,
        take: Number(limit),
        include: {
          user: true, 
        },
      });
      const total = await this.prisma.customer.count({ where });

      return {
        success: true,
        message: 'customer data founded successfully',
        data: customer,
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
        message: `error when get customer: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: number) {
    try {
      const customer = await this.prisma.customer.findFirst({
        where: { id: id },
        include: {
          user: true, 
        },
      });
      if (!customer) {
        return {
          success: false,
          message: 'Customer does not exists',
          data: null,
        };
      }
      return {
        success: true,
        message: 'customer data founded successfully',
        data: customer,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when get customer: ${error.message}`,
        data: null,
      };
    }
  }

  async getMe(userId: number) {
  try {
    const customerProfile = await this.prisma.customer.findFirst({
      where: { userId: userId },
      include: { user: true },  
    });

    if (!customerProfile) {
      return { 
        success: false, 
        message: 'Customer profile not found', 
        data: null };
    }

    if (customerProfile.user) {
      delete (customerProfile.user as any).password;
    }

    return { 
      success: true, 
      message: 'your customer profile founded successfully', 
      data: customerProfile };
  } catch (error: any) {
    return { 
      success: false, 
      message: `error when get your customer profile: ${error.message}`, 
      data: null };
  }
}

  async update(id: number, updateCustomerDto: UpdateCustomerDto, file?: Express.Multer.File) {
    try {
      const { name, phone, address, username, email, password } = updateCustomerDto;
      
      const findCustomer = await this.prisma.customer.findFirst({
        where: { id: id },
      });
      if (!findCustomer) {
        return {
          success: false,
          message: 'Customer does not exists',
          data: null,
        };
      }

      let photoUrl = findCustomer.photo;

      if (file) {
        if (findCustomer.photo) {
          try {
            await this.cloudinary.deleteFile(findCustomer.photo);
          } catch (deleteError) {
            console.log('Gagal menghapus foto lama di Cloudinary', deleteError);
          }
        }
        const uploadResult = await this.cloudinary.uploadFile(file, 'customer_photos');
        photoUrl = uploadResult.secure_url;
      }

      const userUpdateData: any = {};
      if (username) userUpdateData.username = username;
      if (email) userUpdateData.email = email;
      if (password) userUpdateData.password = await this.bcrypt.hashPassword(password);

      const updateCustomer = await this.prisma.customer.update({
        where: { id: id },
        data: {
          name: name ?? findCustomer.name,
          phone: phone ?? findCustomer.phone,
          address: address ?? findCustomer.address,
          photo: photoUrl,
          user: Object.keys(userUpdateData).length > 0 ? { update: userUpdateData } : undefined,
        },
        include: {
          user: true, 
        },
      });

      return {
        success: true,
        message: 'New Customer has updated',
        data: updateCustomer,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when update customer: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: number) {
    try {
      const findCustomer = await this.prisma.customer.findFirst({
        where: { id: id },
      });
      if (!findCustomer) {
        return {
          success: false,
          message: 'Customer does not exists',
          data: null,
        };
      }

      if (findCustomer.photo) {
        try {
          await this.cloudinary.deleteFile(findCustomer.photo);
        } catch (deleteError) {
          console.log('Gagal menghapus foto customer di Cloudinary', deleteError);
        }
      }

      const deletedCustomer = await this.prisma.customer.delete({
        where: { id: id },
        include: {
          user: true, 
        },
      });
      return {
        success: true,
        message: 'customer has deleted',
        data: deletedCustomer,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `error when delete customer : ${error.message}`,
        data: null,
      };
    }
  }
}