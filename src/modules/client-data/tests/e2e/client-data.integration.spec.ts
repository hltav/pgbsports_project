import { Test } from '@nestjs/testing';
import { ClientDataService } from '../../client-data.service';
import { PrismaService } from './../../../../libs/database/prisma';
import { ClientDataModule } from '../../client-data.module';

describe('ClientDataService - Integration', () => {
  let service: ClientDataService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ClientDataModule],
      providers: [ClientDataService, PrismaService],
    }).compile();

    service = module.get(ClientDataService);
    prisma = module.get(PrismaService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.clientData.deleteMany();
  });

  afterAll(async () => {
    await prisma.clientData.deleteMany();
    await prisma.$disconnect();
  });

  it('should create and fetch client data', async () => {
    const dto = {
      userId: 1,
      image: 'img.png',
      gender: 'MALE',
      cpf: '00000000000',
      phone: '11999999999',
      address: {
        city: 'SP',
        state: 'SP',
        country: 'BR',
      },
    };

    const created = await service.createClientData(dto);

    const found = await service.getClientData(created.id);

    expect(found?.userId).toBe(1);
    expect(found?.address?.city).toBe('SP');
  });
});
