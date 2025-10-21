import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { AddressDTO, ClientDataDTO } from '../dto';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service';

@Injectable()
export class GetClientDataService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async execute(userId: number): Promise<ClientDataDTO> {
    const clientData = await this.prisma.clientData.findUnique({
      where: { userId },
      include: { address: true },
    });

    if (!clientData) {
      throw new NotFoundException(
        `ClientData com ID ${userId} não encontrado.`,
      );
    }

    const decryptedClientData = this.decryptClientData(clientData);

    return decryptedClientData;
  }

  private decryptClientData(clientData: ClientDataDTO): ClientDataDTO {
    return {
      ...clientData,
      gender: clientData.gender
        ? this.encryptionService.decrypt(clientData.gender)
        : undefined,
      cpf: clientData.cpf
        ? this.encryptionService.decrypt(clientData.cpf)
        : undefined,
      phone: clientData.phone
        ? this.encryptionService.decrypt(clientData.phone)
        : undefined,
      image: clientData.image
        ? this.encryptionService.decrypt(clientData.image)
        : undefined,

      address: clientData.address
        ? this.decryptAddress(clientData.address)
        : undefined,
    };
  }

  private decryptAddress(address: AddressDTO): AddressDTO {
    return {
      ...address,
      direction: address.direction
        ? this.encryptionService.decrypt(address.direction)
        : null,
      houseNumber: address.houseNumber
        ? this.encryptionService.decrypt(address.houseNumber)
        : null,
      neighborhood: address.neighborhood
        ? this.encryptionService.decrypt(address.neighborhood)
        : null,
      city: address.city ? this.encryptionService.decrypt(address.city) : null,
      state: address.state
        ? this.encryptionService.decrypt(address.state)
        : null,
      country: address.country
        ? this.encryptionService.decrypt(address.country)
        : null,
    };
  }
}
