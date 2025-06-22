import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './../../../../libs/database/prisma';
import { ClientDataService } from '../../client-data.service';
import {
  CreateClientDataService,
  GetClientDataService,
  GetMyClientDataService,
  UpdateClientDataService,
  UpdateClientImageService,
} from '../../services';

describe('ClientDataService', () => {
  let service: ClientDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientDataService,
        PrismaService,
        CreateClientDataService,
        GetMyClientDataService,
        GetClientDataService,
        UpdateClientDataService,
        UpdateClientImageService,
      ],
    }).compile();

    service = module.get<ClientDataService>(ClientDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
