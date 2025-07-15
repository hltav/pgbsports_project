import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Validação das variáveis de ambiente
        const requiredEnvVars = [
          'MAIL_HOST',
          'MAIL_USER',
          'MAIL_PASS',
          'MAIL_FROM',
        ];
        requiredEnvVars.forEach((envVar) => {
          if (!configService.get(envVar)) {
            throw new Error(`Variável de ambiente ${envVar} não definida`);
          }
        });

        return {
          transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: configService.get<number>('MAIL_PORT', 587),
            secure: configService.get<boolean>('MAIL_SECURE', false),
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: `"${configService.get<string>('MAIL_FROM_NAME', 'RT Sports')}" <${configService.get<string>('MAIL_FROM')}>`,
          },
          template: {
            dir: '/var/www/rtsmanager_backend/dist/libs/services/mailer/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailModule {}
