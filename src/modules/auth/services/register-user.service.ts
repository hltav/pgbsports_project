// import { ConflictException, Injectable } from '@nestjs/common';
// import { PrismaService } from '../../../libs/database/prisma';
// import { CreateUserDTO, GetUserDTO } from '../../../libs/common/dto/user';
// import { CryptoService } from './../../../libs/crypto/services/crypto.service';

// @Injectable()
// export class RegisterUserService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly crypto: CryptoService,
//   ) {}

//   async execute(createUser: CreateUserDTO): Promise<GetUserDTO> {
//     const [existingByEmail, existingByNickname] = await Promise.all([
//       this.prisma.user.findUnique({ where: { email: createUser.email } }),
//       this.prisma.user.findUnique({ where: { nickname: createUser.nickname } }),
//     ]);

//     if (existingByEmail) {
//       throw new ConflictException('Este e-mail já está em uso.');
//     }

//     if (existingByNickname) {
//       throw new ConflictException('Este nome de usuário já está em uso.');
//     }

//     const hashedPassword: string = await this.crypto.hashPassword(
//       createUser.password,
//     );

//     const newUser = await this.prisma.user.create({
//       data: {
//         ...createUser,
//         password: hashedPassword,
//         role: createUser.role || 'USER',
//       },
//       select: {
//         id: true,
//         firstname: true,
//         lastname: true,
//         nickname: true,
//         email: true,
//       },
//     });

//     return newUser;
//   }
// }

import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import { CreateUserDTO, GetUserDTO } from '../../../libs/common/dto/user';
import { CryptoService } from '../../../libs/crypto/services/crypto.service';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { EmailService } from './../../../libs/services/mailer/mail.service';

@Injectable()
export class RegisterUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly mailService: EmailService,
  ) {}

  async execute(createUser: CreateUserDTO): Promise<GetUserDTO> {
    const [existingByEmail, existingByNickname] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: createUser.email } }),
      this.prisma.user.findUnique({ where: { nickname: createUser.nickname } }),
    ]);

    if (existingByEmail)
      throw new ConflictException('Este e-mail já está em uso.');
    if (existingByNickname)
      throw new ConflictException('Este nome de usuário já está em uso.');

    const hashedPassword = await this.crypto.hashPassword(createUser.password);

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

    const token = randomUUID();
    const expiresAt = addMinutes(new Date(), 30);

    await this.prisma.emailVerification.create({
      data: {
        userId: newUser.id,
        token,
        expiresAt,
      },
    });

    await this.mailService.sendEmailConfirmation(
      {
        email: newUser.email,
        name: newUser.firstname,
      },
      token,
    );

    return newUser;
  }
}
