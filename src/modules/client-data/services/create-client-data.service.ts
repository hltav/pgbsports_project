// import { Injectable } from '@nestjs/common';
// import { PrismaService } from './../../../libs/database/prisma/prisma.service';
// import { ClientDataDTO, CreateClientDataDTO } from '../dto';

// @Injectable()
// export class CreateClientDataService {
//   constructor(private prisma: PrismaService) {}

//   async execute(data: CreateClientDataDTO): Promise<ClientDataDTO> {
//     const { address, ...clientData } = data;

//     const created = await this.prisma.clientData.create({
//       data: {
//         ...clientData,
//         address: address ? { create: address } : undefined,
//       },
//       include: { address: true },
//     });

//     return created as ClientDataDTO;
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../../libs/database/prisma/prisma.service';
import { ClientDataDTO, CreateClientDataDTO } from '../dto';
import { EncryptionService } from './../../../libs/EncryptedData/services/encryptedData.service'; // ← Importe

@Injectable()
export class CreateClientDataService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async execute(data: CreateClientDataDTO): Promise<ClientDataDTO> {
    const { address, ...clientData } = data;

    const encryptedClientData = {
      gender: this.encryptionService.encrypt(clientData.gender),
      cpf: this.encryptionService.encrypt(clientData.cpf),
      image: this.encryptionService.encrypt(clientData.image),
      userId: clientData.userId,
      phone: clientData.phone
        ? this.encryptionService.encrypt(clientData.phone)
        : '',
    };

    const created = await this.prisma.clientData.create({
      data: {
        ...encryptedClientData,
        address: address
          ? {
              create: {
                direction: address.direction
                  ? this.encryptionService.encrypt(address.direction)
                  : null,
                houseNumber: address.houseNumber
                  ? this.encryptionService.encrypt(address.houseNumber)
                  : null,
                neighborhood: address.neighborhood
                  ? this.encryptionService.encrypt(address.neighborhood)
                  : null,
                city: address.city
                  ? this.encryptionService.encrypt(address.city)
                  : null,
                state: address.state
                  ? this.encryptionService.encrypt(address.state)
                  : null,
                country: address.country
                  ? this.encryptionService.encrypt(address.country)
                  : null,
              },
            }
          : undefined,
      },
      include: { address: true },
    });

    return created as ClientDataDTO;
  }
}
