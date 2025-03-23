import { Module } from '@nestjs/common';
import {
  AdminModule,
  AuthModule,
  BankrollModule,
  ClientDataModule,
  EventsModule,
  PredictionsModule,
  StatisticsModule,
  SubscriptionsModule,
  UsersModule,
} from './src';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AdminModule,
    BankrollModule,
    EventsModule,
    PredictionsModule,
    StatisticsModule,
    SubscriptionsModule,
    ClientDataModule,
  ],
  providers: [],
  exports: [],
})
export class AllmoduleModule {}
