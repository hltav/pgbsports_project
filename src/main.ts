// import 'reflect-metadata';
// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   app.enableCors({
//     origin: 'http://localhost:3000',
//     credentials: true,
//   });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//       transformOptions: {
//         enableImplicitConversion: true,
//       },
//     }),
//   );

//   app.useStaticAssets(join(process.cwd(), 'uploads'), {
//     prefix: '/uploads',
//   });

//   await app.listen(3003);
// }
// bootstrap().catch((err) => {
//   console.error('Erro ao iniciar aplicação:', err);
//   process.exit(1);
// });

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'path';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(cors, {
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 3 * 1024 * 1024, // 3 MB
    },
  });

  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen({ port: 3003, host: '0.0.0.0' });
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar aplicação:', err);
  process.exit(1);
});
