import { Module } from '@nestjs/common';
import {
  AdminModule,
  AuthModule,
  BankrollModule,
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
  ],
  providers: [],
  exports: [],
})
export class AllmoduleModule {}
