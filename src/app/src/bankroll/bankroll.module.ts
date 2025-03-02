import { Module } from '@nestjs/common';
import { BankrollService } from './bankroll.service';

@Module({
  providers: [BankrollService],
})
export class BankrollModule {}
