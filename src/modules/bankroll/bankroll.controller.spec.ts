import { PrismaService } from './../../libs/database/prisma';;
import { Test, TestingModule } from '@nestjs/testing';
import { BankrollController } from './bankroll.controller';
import { BankrollService } from './bankroll.service';

describe('BankrollController', () => {
  let controller: BankrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankrollController],
      providers: [BankrollService, PrismaService],
    }).compile();

    controller = module.get<BankrollController>(BankrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
