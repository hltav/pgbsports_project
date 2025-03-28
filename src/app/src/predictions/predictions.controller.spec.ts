import { Test, TestingModule } from '@nestjs/testing';
import { PredictionsController } from './predictions.controller';
import { PrismaService } from '../../../libs/database/src/prisma';;
import { PredictionsService } from './predictions.service';

describe('PredictionsController', () => {
  let controller: PredictionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredictionsController],
      providers: [PredictionsService, PrismaService],
    }).compile();

    controller = module.get<PredictionsController>(PredictionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
