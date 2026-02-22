import { ForbiddenException, Injectable } from '@nestjs/common';
import { GetUserDTO } from './../../../libs';
import { PrismaService } from './../../../libs/database';
import { UserWithClientData } from './../../../libs';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service';
import { Role } from '@prisma/client';
import { AuthContext } from '../proxies/serviceProxies';

@Injectable()
export class UserFindService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private safeDecrypt(value: string | null | undefined): string | undefined {
    if (!value) return undefined;

    const parts = value.split(':');
    if (parts.length !== 3) {
      console.warn(
        `Valor não está no formato de criptografia esperado: ${value}`,
      );
      return value;
    }

    try {
      return this.encryptionService.decrypt(value);
    } catch (error) {
      console.error(`Erro ao descriptografar valor: ${value}`, error);

      return value;
    }
  }

  private decryptUser(user: GetUserDTO): Partial<GetUserDTO> {
    const decrypted = {
      ...user,
      firstname: this.safeDecrypt(user.firstname),
      lastname: this.safeDecrypt(user.lastname),
      nickname: this.safeDecrypt(user.nickname),
      email: this.safeDecrypt(user.email),
      clientData: user.clientData
        ? {
            ...user.clientData,
            cpf: this.safeDecrypt(user.clientData.cpf),
            phone: this.safeDecrypt(user.clientData.phone),
            gender: this.safeDecrypt(user.clientData.gender),
            image: this.safeDecrypt(user.clientData.image),
            address: user.clientData.address
              ? {
                  ...user.clientData.address,
                  neighborhood: this.safeDecrypt(
                    user.clientData.address.neighborhood,
                  ),
                  city: this.safeDecrypt(user.clientData.address.city),
                  state: this.safeDecrypt(user.clientData.address.state),
                  country: this.safeDecrypt(user.clientData.address.country),
                }
              : undefined,
          }
        : undefined,
    };

    return decrypted;
  }

  async findAllUsers(currentUser: {
    id: number;
    role: Role;
  }): Promise<Partial<GetUserDTO>[]> {
    if (currentUser.role === Role.USER) {
      throw new ForbiddenException('Usuário não pode listar todos os usuários');
    }

    let whereClause = {};

    // ADMIN só pode listar usuários comuns
    if (currentUser.role === Role.ADMIN) {
      whereClause = { role: Role.USER };
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
        clientData: { include: { address: true } },
      },
    });

    return users.map((user) => this.decryptUser(user));
  }

  async findUserById(
    id: number,
    currentUser: { id: number; role: Role },
  ): Promise<Partial<GetUserDTO> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        role: true,
        clientData: { include: { address: true } },
      },
    });

    if (!user) return null;

    // 🔐 SUPER_ADMIN pode tudo
    if (currentUser.role !== Role.SUPER_ADMIN) {
      // USER só pode ver a si mesmo
      if (currentUser.role === Role.USER) {
        if (currentUser.id !== id) {
          throw new ForbiddenException('Você não pode visualizar este usuário');
        }
      }

      // ADMIN só pode ver USER
      if (currentUser.role === Role.ADMIN) {
        if (user.role !== Role.USER) {
          throw new ForbiddenException(
            'ADMIN não pode visualizar este usuário',
          );
        }
      }
    }

    return this.decryptUser(user);
  }

  async findOneByEmail(
    email: string,
    currentUser: AuthContext,
  ): Promise<UserWithClientData | null> {
    const searchableEmailHash = this.encryptionService.generateSearchableHash(
      email.toLowerCase(),
    );

    const user = await this.prisma.user.findUnique({
      where: { searchableEmailHash },
      include: { clientData: { include: { address: true } } },
    });

    if (!user) return null;

    // 🔐 SUPER_ADMIN pode tudo
    if (currentUser.role === Role.SUPER_ADMIN) {
      return this.decryptUser(user) as UserWithClientData;
    }

    // 🔐 ADMIN só pode buscar USER
    if (currentUser.role === Role.ADMIN) {
      if (user.role !== Role.USER) {
        throw new ForbiddenException('ADMIN não pode visualizar este usuário');
      }

      return this.decryptUser(user) as UserWithClientData;
    }

    // 🔐 USER só pode buscar a si mesmo
    if (currentUser.role === Role.USER) {
      if (currentUser.id !== user.id) {
        throw new ForbiddenException('Você não pode visualizar este usuário');
      }

      return this.decryptUser(user) as UserWithClientData;
    }

    throw new ForbiddenException('Acesso não permitido');
  }

  async findOneByEmailSystem(
    email: string,
  ): Promise<UserWithClientData | null> {
    const searchableEmailHash = this.encryptionService.generateSearchableHash(
      email.toLowerCase(),
    );

    const user = await this.prisma.user.findUnique({
      where: { searchableEmailHash },
      include: { clientData: { include: { address: true } } },
    });

    if (!user) return null;

    return this.decryptUser(user) as UserWithClientData;
  }
}
