import { PrismaService } from '../../../libs/database/src/prisma';;
import { Test, TestingModule } from '@nestjs/testing';
import { ClientDataController } from './client-data.controller';
import { ClientDataService } from './client-data.service';

describe('ClientDataController', () => {
  let controller: ClientDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientDataController],
      providers: [ClientDataService, PrismaService],
    }).compile();

    controller = module.get<ClientDataController>(ClientDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
