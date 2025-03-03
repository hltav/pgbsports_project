import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BankrollController } from './app/src/bankroll/bankroll.controller';
import { EventsService } from './app/src/events/events.service';
import { PredictionsController } from './app/src/predictions/predictions.controller';
import { PredictionsService } from './app/src/predictions/predictions.service';
import { SubscriptionsController } from './app/src/subscriptions/subscriptions.controller';
import { AdminService } from './app/src/admin/admin.service';
import { LibsModule } from './libs/libs.module';
import { AllmoduleModule } from './app/allmodule.module';

@Module({
  imports: [ConfigModule.forRoot(), LibsModule, AllmoduleModule],
  controllers: [
    AppController,
    BankrollController,
    PredictionsController,
    SubscriptionsController,
  ],
  providers: [
    AppService,
    JwtService,
    EventsService,
    PredictionsService,
    AdminService,
  ],
})
export class AppModule {}
