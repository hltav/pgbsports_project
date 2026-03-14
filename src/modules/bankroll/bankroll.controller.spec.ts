import { PrismaService } from './../../libs/database/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { BankrollController } from './bankroll.controller';
import { BankrollService } from './bankroll.service';
import { CreateBankrollService } from './core/services/create-bankroll.service';
import { DeleteBankrollService } from './core/services/delete-bankroll.service';
import { FindBankrollService } from './core/services/find-bankroll.service';
import { UpdateBankrollService } from './core/services/update-bankroll.service';

describe('BankrollController', () => {
  let controller: BankrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankrollController],
      providers: [
        BankrollService,
        PrismaService,
        CreateBankrollService,
        FindBankrollService,
        UpdateBankrollService,
        DeleteBankrollService,
      ],
    }).compile();

    controller = module.get<BankrollController>(BankrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
