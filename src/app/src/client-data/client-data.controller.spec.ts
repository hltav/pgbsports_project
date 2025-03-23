import { Test, TestingModule } from '@nestjs/testing';
import { ClientDataController } from './client-data.controller';

describe('ClientDataController', () => {
  let controller: ClientDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientDataController],
    }).compile();

    controller = module.get<ClientDataController>(ClientDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
