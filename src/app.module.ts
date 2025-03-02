import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './app/src/users/users.module';
import { PrismaModule } from './libs/database/src/prisma/prisma.module';
import { AuthModule } from './app/src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BankrollController } from './app/src/bankroll/bankroll.controller';
import { BankrollModule } from './app/src/bankroll/bankroll.module';
import { EventsService } from './app/src/events/events.service';
import { EventsModule } from './app/src/events/events.module';
import { PredictionsController } from './app/src/predictions/predictions.controller';
import { PredictionsService } from './app/src/predictions/predictions.service';
import { PredictionsModule } from './app/src/predictions/predictions.module';
import { StatisticsModule } from './app/src/statistics/statistics.module';
import { SubscriptionsController } from './app/src/subscriptions/subscriptions.controller';
import { SubscriptionsModule } from './app/src/subscriptions/subscriptions.module';
import { AdminService } from './app/src/admin/admin.service';
import { AdminModule } from './app/src/admin/admin.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, PrismaModule, AuthModule, BankrollModule, EventsModule, PredictionsModule, StatisticsModule, SubscriptionsModule, AdminModule],
  controllers: [AppController, BankrollController, PredictionsController, SubscriptionsController],
  providers: [AppService, JwtService, EventsService, PredictionsService, AdminService],
})
export class AppModule {}
