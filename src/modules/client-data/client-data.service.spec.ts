import { Test, TestingModule } from '@nestjs/testing';
import { ClientDataService } from './client-data.service';
import { PrismaService } from '../../libs/database/prisma';;

describe('ClientDataService', () => {
  let service: ClientDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientDataService, PrismaService],
    }).compile();

    service = module.get<ClientDataService>(ClientDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
