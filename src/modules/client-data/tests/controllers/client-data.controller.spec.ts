import { PrismaService } from './../../../../libs/database';
import { ClientDataService } from '../../client-data.service';
import { ClientDataController } from '../../controllers/client-data.controller';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateClientDataService,
  GetClientDataService,
  GetMyClientDataService,
  UpdateClientDataService,
  UpdateClientImageService,
} from '../../services';
import { ImageService } from './../../../../modules/image/image.service';
import { LocalStorageService } from './../../../../modules/image/storage';

describe('ClientDataController', () => {
  let controller: ClientDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientDataController],
      providers: [
        ClientDataService,
        PrismaService,
        ImageService,
        {
          provide: 'StorageService',
          useClass: LocalStorageService,
        },
        CreateClientDataService,
        GetMyClientDataService,
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
