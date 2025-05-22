import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import { CreateUserDTO, GetUserDTO } from '../../../libs/common/dto/user';
import { CryptoService } from './../../../libs/crypto/services/crypto.service';

@Injectable()
export class RegisterUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  async execute(createUser: CreateUserDTO): Promise<GetUserDTO> {
    const [existingByEmail, existingByNickname] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: createUser.email } }),
      this.prisma.user.findUnique({ where: { nickname: createUser.nickname } }),
    ]);

    if (existingByEmail) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    if (existingByNickname) {
      throw new ConflictException('Este nome de usuário já está em uso.');
    }

    const hashedPassword: string = await this.crypto.hashPassword(
      createUser.password,
    );

    const newUser = await this.prisma.user.create({
      data: {
        ...createUser,
        password: hashedPassword,
        role: createUser.role || 'USER',
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
