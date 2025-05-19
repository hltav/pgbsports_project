import { PrismaService } from './../../../../libs/database';
import { ClientDataService } from '../../client-data.service';
import { ClientDataController } from '../../controllers/client-data.controller';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateClientDataService,
  GetClientDataService,
  UpdateClientDataService,
  UpdateClientImageService,
} from '../../services';

describe('ClientDataController', () => {
  let controller: ClientDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientDataController],
      providers: [
        ClientDataService,
        PrismaService,
        CreateClientDataService,
        GetClientDataService,
        UpdateClientDataService,
        UpdateClientImageService,
      ],
    }).compile();

    controller = module.get<ClientDataController>(ClientDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
