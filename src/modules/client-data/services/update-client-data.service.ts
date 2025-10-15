import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { ClientDataDTO, UpdateClientDataDTO } from '../dto';
import { UpdateClientDataSchema } from '../dto/update-client-data.dto';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service';

@Injectable()
export class UpdateClientDataService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async execute(
    id: number,
    update: UpdateClientDataDTO,
  ): Promise<ClientDataDTO> {
    const validated = UpdateClientDataSchema.parse(update);

    const existing = await this.prisma.clientData.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Dados do cliente não encontrados');
    }

    const { address, ...clientData } = validated;

    const encryptedClientData = {
      gender: clientData.gender
        ? this.encryptionService.encrypt(clientData.gender)
        : existing.gender,
      cpf: clientData.cpf
        ? this.encryptionService.encrypt(clientData.cpf)
        : existing.cpf,
      image: clientData.image
        ? this.encryptionService.encrypt(clientData.image)
        : existing.image,
      phone: clientData.phone
        ? this.encryptionService.encrypt(clientData.phone)
        : existing.phone,
    };

    const encryptedAddress = address
      ? {
          direction: address.direction
            ? this.encryptionService.encrypt(address.direction)
            : undefined,
          houseNumber: address.houseNumber
            ? this.encryptionService.encrypt(address.houseNumber)
            : undefined,
          neighborhood: address.neighborhood
            ? this.encryptionService.encrypt(address.neighborhood)
            : undefined,
          city: address.city
            ? this.encryptionService.encrypt(address.city)
            : undefined,
          state: address.state
            ? this.encryptionService.encrypt(address.state)
            : undefined,
          country: address.country
            ? this.encryptionService.encrypt(address.country)
            : undefined,
        }
      : undefined;

    const updated = await this.prisma.clientData.update({
      where: { id },
      data: {
        ...encryptedClientData,
        address: encryptedAddress
          ? {
              upsert: {
                create: encryptedAddress,
                update: encryptedAddress,
              },
            }
          : undefined,
      },
      include: { address: true },
    });

    return {
      ...updated,
      gender: updated.gender
        ? this.encryptionService.decrypt(updated.gender)
        : null,
      cpf: updated.cpf ? this.encryptionService.decrypt(updated.cpf) : null,
      image: updated.image
        ? this.encryptionService.decrypt(updated.image)
        : null,
      phone: updated.phone
        ? this.encryptionService.decrypt(updated.phone)
        : null,
      address: updated.address
        ? {
            ...updated.address,
            direction: updated.address.direction
              ? this.encryptionService.decrypt(updated.address.direction)
              : null,
            houseNumber: updated.address.houseNumber
              ? this.encryptionService.decrypt(updated.address.houseNumber)
              : null,
            neighborhood: updated.address.neighborhood
              ? this.encryptionService.decrypt(updated.address.neighborhood)
              : null,
            city: updated.address.city
              ? this.encryptionService.decrypt(updated.address.city)
              : null,
            state: updated.address.state
              ? this.encryptionService.decrypt(updated.address.state)
              : null,
            country: updated.address.country
              ? this.encryptionService.decrypt(updated.address.country)
              : null,
          }
        : null,
    } as ClientDataDTO;
  }
}
