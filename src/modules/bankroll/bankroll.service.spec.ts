import { PrismaService } from './../../libs/database/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { BankrollService } from './bankroll.service';
import {
  CreateBankrollService,
  DeleteBankrollService,
  FindBankrollService,
  UpdateBankrollService,
} from './services';

describe('BankrollService', () => {
  let service: BankrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankrollService,
        PrismaService,
        CreateBankrollService,
        FindBankrollService,
        UpdateBankrollService,
        DeleteBankrollService,
      ],
    }).compile();

    service = module.get<BankrollService>(BankrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
