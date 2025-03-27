import { PrismaService } from './../../../libs';
import { Test, TestingModule } from '@nestjs/testing';
import { BankrollService } from './bankroll.service';

describe('BankrollService', () => {
  let service: BankrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankrollService, PrismaService],
    }).compile();

    service = module.get<BankrollService>(BankrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
