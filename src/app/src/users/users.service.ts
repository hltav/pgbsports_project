import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import {
  CreateUserDTO,
  GetUserDTO,
  UpdateUserDTO,
} from '../../../libs/common/src/dto/user.dto';
import { PrismaService } from 'src/libs/database/src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUser: CreateUserDTO): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: createUser.email }, { nickname: createUser.nickname }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or Nickname User already registered!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUser.password, saltRounds);

    return this.prisma.user.create({
      data: {
        ...createUser,
        password: hashedPassword,
        role: createUser.role || Role.USER,
      },
    });
  }

  async findAllUsers(): Promise<Partial<GetUserDTO>[]> {
    return this.prisma.user.findMany({
      select: {
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
      },
    });
  }

  async findUserById(id: number): Promise<Partial<GetUserDTO> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    console.log('Procurando usuário com email:', email);

    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log('Usuário encontrado:', user);
    return user;
  }

  async findOneByNicknameOrEmail(identifier: string): Promise<User | null> {
    console.log('Procurando usuário com identifier:', identifier);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ nickname: identifier }, { email: identifier }],
      },
    });
    console.log('Usuário encontrado:', user);
    return user;
  }

  async update(id: number, updateUser: Partial<UpdateUserDTO>): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const dataToUpdate: Partial<UpdateUserDTO> = { ...updateUser };

    if (updateUser.password) {
      const saltRounds = 10;
      dataToUpdate.password = await bcrypt.hash(
        updateUser.password,
        saltRounds,
      );
    }

    return this.prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
  }

  async delete(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      throw new NotFoundException('User not Found!');
    }

    await this.prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    return user;
  }
}
