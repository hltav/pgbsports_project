import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { ClientDataDTO, UpdateClientDataDTO } from '../dto';
import { UpdateClientDataSchema } from '../dto/update-client-data.dto';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service'; // ← Importe

@Injectable()
export class UpdateClientDataService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService, // ← Adicione no constructor
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

    // Criptografa os dados do cliente igual na função create
    const encryptedClientData = {
      gender: clientData.gender
        ? this.encryptionService.encrypt(clientData.gender)
        : existing.gender, // Mantém o existente se não for fornecido
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

    // Criptografa os dados do endereço se fornecidos
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

    return this.prisma.clientData.update({
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
  }
}
