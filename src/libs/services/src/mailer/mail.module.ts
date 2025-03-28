import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importe ConfigModule e ConfigService
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Importe ConfigModule aqui
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: false, // TLS
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        template: {
          dir: path.join(__dirname, 'templates'), // Caminho para templates
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
    ConfigModule, // Importe ConfigModule aqui (nível superior do @Module)
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
