/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { GetUserDTO } from './../../../libs';
import { PrismaService } from './../../../libs/database';
import { UserWithClientData } from './../../../libs';
import { Role } from './../../../libs/common/enum/role.enum';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service';

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
      // Retorna o valor original se a descriptografia falhar
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

  async findAllUsers(role?: Role): Promise<Partial<GetUserDTO>[]> {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : {},
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
    role?: Role,
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

    return this.decryptUser(user);
  }

  async findOneByEmail(email: string): Promise<UserWithClientData | null> {
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
