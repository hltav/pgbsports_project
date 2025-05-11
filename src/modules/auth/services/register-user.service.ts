import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, GetUserDTO } from '../../../libs/common/dto/user';

@Injectable()
export class RegisterUserService {
  constructor(private prisma: PrismaService) {}

  async execute(createUser: CreateUserDTO): Promise<GetUserDTO> {
    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: createUser.email },
    });

    if (existingByEmail) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const existingByNickname = await this.prisma.user.findUnique({
      where: { nickname: createUser.nickname },
    });

    if (existingByNickname) {
      throw new ConflictException('Este nome de usuário já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(createUser.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...createUser,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
      },
    });

    return newUser;
  }
}
