import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from '../bcrypt/bcrypt.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly bcrypt: BcryptService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { username, email, password, role } = createUserDto;

      const createUser = await this.prisma.user.create({
        data: {
          username,
          email,
          password: await this.bcrypt.hashPassword(password),
          role,
        },
      });

      return {
        success: true,
        message: 'User created successfully',
        data: createUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error when creating user: ${error.message}`,
        data: null,
      };
    }
  }

  async findAll(findUserDto: FindUserDto) {
    try {
      const { search = '', page = 1, limit = 10, sortBy, sortOrder = 'asc' } = findUserDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { username: { contains: search } },
          { email: { contains: search } },
        ];
      }

      const orderBy: any = sortBy ? { [sortBy]: sortOrder } : { id: 'asc' };

      const users = await this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
      });

      const total = await this.prisma.user.count({ where });

      return {
        success: true,
        message: 'User data found successfully',
        data: users,
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
        message: `Error when getting users: ${error.message}`,
        data: null,
      };
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: id },
      });

      if (!user) {
        return {
          success: false,
          message: 'User does not exist',
          data: null,
        };
      }

      return {
        success: true,
        message: 'User data found successfully',
        data: user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error when getting user: ${error.message}`,
        data: null,
      };
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const { username, email, password, role } = updateUserDto;

      const findUser = await this.prisma.user.findFirst({
        where: { id: id },
      });

      if (!findUser) {
        return {
          success: false,
          message: 'User does not exist',
          data: null,
        };
      }

      let hashedPassword = findUser.password;
      if (password) {
        hashedPassword = await this.bcrypt.hashPassword(password);
      }

      const updateUser = await this.prisma.user.update({
        where: { id: id },
        data: {
          username: username ?? findUser.username,
          email: email ?? findUser.email,
          password: hashedPassword,
          role: role ?? findUser.role,
        },
      });

      return {
        success: true,
        message: 'User has been updated',
        data: updateUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error when updating user: ${error.message}`,
        data: null,
      };
    }
  }

  async remove(id: number) {
    try {
      const findUser = await this.prisma.user.findFirst({
        where: { id: id },
      });

      if (!findUser) {
        return {
          success: false,
          message: 'User does not exist',
          data: null,
        };
      }

      const deletedUser = await this.prisma.user.delete({
        where: { id: id },
      });

      return {
        success: true,
        message: 'User has been deleted',
        data: deletedUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error when deleting user: ${error.message}`,
        data: null,
      };
    }
  }
}