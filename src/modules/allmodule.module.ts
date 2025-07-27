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
import { ImageModule } from './image/image.module';
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
    ImageModule,
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
    ImageModule,
  ],
})
export class AllmoduleModule {}
