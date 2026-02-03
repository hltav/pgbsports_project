import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BankrollModule } from './bankroll/bankroll.module';
import { ClientDataModule } from './client-data/client-data.module';
import { EventsModule } from './events/events.module';
import { PredictionsModule } from './predictions/predictions.module';
import { StatisticsModule } from './statistics/statistics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';
import { MyCacheModule } from './../libs/services/cache/cache.module';
import { EncryptedDataModule } from './../libs/EncryptedData/services/encryptedData.module';
import { MatchsModule } from './matchs/matchs.module';

@Module({
  imports: [
    MyCacheModule,
    UsersModule,
    AuthModule,
    AdminModule,
    BankrollModule,
    EventsModule,
    PredictionsModule,
    StatisticsModule,
    SubscriptionsModule,
    ClientDataModule,
    EncryptedDataModule,
    MatchsModule,
  ],
  providers: [],
  exports: [
    MyCacheModule,
    UsersModule,
    AuthModule,
    AdminModule,
    BankrollModule,
    EventsModule,
    PredictionsModule,
    StatisticsModule,
    SubscriptionsModule,
    ClientDataModule,
    EncryptedDataModule,
    MatchsModule,
  ],
})
export class ModulesModule {}
