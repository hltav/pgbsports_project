import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../libs/database/prisma';
import { CreateUserDTO, GetUserDTO } from '../../../libs/common/dto/user';
import { CryptoService } from '../../../libs/crypto/services/crypto.service';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { EmailService } from '../../../libs/services/mailer/mail.service';
import { EncryptionService } from '../../../libs/EncryptedData/services/encryptedData.service';

@Injectable()
export class RegisterUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly mailService: EmailService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(createUser: CreateUserDTO): Promise<GetUserDTO> {
    const searchableEmailHash = this.encryptionService.generateSearchableHash(
      createUser.email.toLowerCase(),
    );

    const [existingByHash, existingByNickname] = await Promise.all([
      this.prisma.user.findUnique({ where: { searchableEmailHash } }),
      this.prisma.user.findUnique({ where: { nickname: createUser.nickname } }),
    ]);

    if (existingByHash) {
      throw new ConflictException(
        'Usuário já registrado. Favor realizar o login.',
      );
    }
    if (existingByNickname) {
      throw new ConflictException('Este nome de usuário já está em uso.');
    }

    const emailToSend = createUser.email;
    const nameToSend = createUser.firstname;

    const encryptedUserData = {
      email: this.encryptionService.encrypt(createUser.email),
      firstname: this.encryptionService.encrypt(createUser.firstname),
      lastname: this.encryptionService.encrypt(createUser.lastname),
      nickname: this.encryptionService.encrypt(createUser.nickname),
      role: createUser.role || 'USER',
    };

    const hashedPassword = await this.crypto.hashPassword(createUser.password);

    const newUser = await this.prisma.user.create({
      data: {
        ...encryptedUserData,
        password: hashedPassword,
        searchableEmailHash,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
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
        email: emailToSend,
        name: nameToSend,
      },
      token,
    );

    const decryptedUser: GetUserDTO = {
      id: newUser.id,
      email: this.encryptionService.decrypt(newUser.email),
      firstname: this.encryptionService.decrypt(newUser.firstname),
      lastname: this.encryptionService.decrypt(newUser.lastname),
      nickname: this.encryptionService.decrypt(newUser.nickname),
      role: newUser.role,
    };

    return decryptedUser;
  }

  testEncryption(data: { text: string }): Promise<{
    original: string;
    encrypted: string;
    decrypted: string;
    hash: string;
  }> {
    const encrypted = this.encryptionService.encrypt(data.text);
    const decrypted = this.encryptionService.decrypt(encrypted);
    const hash = this.encryptionService.generateSearchableHash(data.text);

    return Promise.resolve({
      original: data.text,
      encrypted,
      decrypted,
      hash,
    });
  }
}
