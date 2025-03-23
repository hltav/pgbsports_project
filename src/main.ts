/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // Permite requisições do frontend
    credentials: true, // Permite o envio de cookies e headers de autenticação
  });

  app.useGlobalPipes(new ValidationPipe()); // Adicione o ValidationPipe
  await app.listen(3003);
}
bootstrap();
