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
import cookie from '@fastify/cookie'; // 👈 Novo import
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // await app.register(cors, {
  //   origin: [
  //     'http://localhost:3001',
  //     'https://localhost:3001',
  //     'https://rtsportsmanager.vercel.app',
  //     'http://91.99.55.16',
  //   ],
  //   credentials: true,
  // });

  await app.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = [
        'http://localhost:3001',
        'https://localhost:3001',
        'https://rtsportsmanager.vercel.app',
        'http://91.99.55.16',
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        // permitir origin
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), '');
      }
    },
    credentials: true,
  });

  await app.register(cookie);

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

  await app.listen({ port, host: '0.0.0.0' });
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar aplicação:', err);
  process.exit(1);
});
