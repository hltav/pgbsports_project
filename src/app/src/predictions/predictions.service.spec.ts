import { Test, TestingModule } from '@nestjs/testing';
import { PredictionsService } from './predictions.service';
import { PrismaService } from '../../../libs/database/src/prisma';;

describe('PredictionsService', () => {
  let service: PredictionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PredictionsService, PrismaService],
    }).compile();

    service = module.get<PredictionsService>(PredictionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
