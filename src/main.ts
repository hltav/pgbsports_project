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
import cookie from '@fastify/cookie';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // 🔧 CORS – Configurado antes de tudo
  await app.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = [
        'http://localhost:3001',
        'https://localhost:3001',
        'https://rtsportsmanager.vercel.app',
        'http://91.99.55.16',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        console.warn(`Blocked CORS origin: ${origin}`);
        cb(new Error('Not allowed by CORS'), '');
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false, // garante que Fastify lida com o OPTIONS
  });

  // 🍪 Cookies
  await app.register(cookie);

  // 📦 Upload de arquivos
  await app.register(multipart, {
    limits: {
      fileSize: 3 * 1024 * 1024, // 3 MB
    },
  });

  // 📂 Arquivos estáticos
  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads', 'avatars'),
    prefix: '/uploads/avatars/',
  });

  // ✅ Pipes de validação globais
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

  // 🚀 Inicialização
  await app.listen({ port, host: '0.0.0.0' });

  console.log(`✅ Server running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar aplicação:', err);
  process.exit(1);
});
