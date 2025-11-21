import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { LogLevel, ValidationPipe } from '@nestjs/common';
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
import * as fs from 'fs';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';

  let fastifyAdapter: FastifyAdapter;

  if (
    isDev &&
    fs.existsSync('./localhost+2-key.pem') &&
    fs.existsSync('./localhost+2.pem')
  ) {
    const httpsOptions = {
      https: {
        key: fs.readFileSync('./localhost+2-key.pem'),
        cert: fs.readFileSync('./localhost+2.pem'),
      },
    };
    fastifyAdapter = new FastifyAdapter(httpsOptions);
  } else {
    fastifyAdapter = new FastifyAdapter();
  }

  const logLevels: LogLevel[] =
    process.env.NODE_ENV === 'production'
      ? ['log', 'warn', 'error']
      : ['log', 'warn', 'error', 'debug', 'verbose'];

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { logger: logLevels },
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // 🔧 CORS – Configurado antes de tudo
  await app.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = [
        'http://localhost:3001',
        'https://localhost:3001',
        'https://app.rtsportsmanager.com',
        'https://admin.rtsportsmanager.com',
        'https://rtsportsmanager.com',
        'https://www.rtsportsmanager.com',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        console.warn(`Blocked CORS origin: ${origin}`);
        cb(new Error('Not allowed by CORS'), '');
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    preflightContinue: false,
  });

  // 🍪 Cookies
  await app.register(cookie);

  // 📦 Upload de arquivos
  await app.register(multipart, {
    limits: {
      fileSize: 4 * 1024 * 1024, // 4 MB
      files: 1,
    },
  });

  // 📂 Arquivos estáticos
  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'public', 'uploads', 'avatars'),
    prefix: '/uploads/avatars/',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
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

  console.log(`🚀✅ Server running on port ${port}🎉🔥`);
}
bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar aplicação:', err);
  process.exit(1);
});
