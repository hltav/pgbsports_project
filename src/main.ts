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
import { LoggingService } from './modules/monitoring/services/logging.service';
import * as fs from 'fs';
import * as path from 'path';
import { SilentExceptionFilter } from './modules/auth/filter/exception.filter';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';

  let fastifyAdapter: FastifyAdapter;

  const certPath = path.resolve(process.cwd(), 'cert', 'localhost+2.pem');
  const keyPath = path.resolve(process.cwd(), 'cert', 'localhost+2-key.pem');

  if (isDev && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    fastifyAdapter = new FastifyAdapter({
      https: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
    });
  } else {
    fastifyAdapter = new FastifyAdapter();
  }

  const logLevels: LogLevel[] =
    process.env.NODE_ENV === 'production'
      ? ['warn', 'error']
      : ['log', 'warn', 'error', 'debug', 'verbose'];

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { logger: logLevels },
  );

  const configService = app.get(ConfigService);
  const loggingService = app.get(LoggingService);
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
        loggingService.warn(`Blocked CORS origin: ${origin}`, 'CORS');
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

  app.useGlobalFilters(new SilentExceptionFilter());

  // 🚀 Inicialização
  await app.listen({ port, host: '0.0.0.0' });

  const protocol =
    isDev && fs.existsSync('./localhost+2-key.pem') ? 'https' : 'http';
  const url = `${protocol}://localhost:${port}`;

  loggingService.log(`🚀 Application is running on: ${url}`, 'Bootstrap');
  loggingService.log(`📊 Health check: ${url}/health`, 'Bootstrap');
  loggingService.log(`📈 Monitoring: ${url}/monitoring/metrics`, 'Bootstrap');
  loggingService.log(
    `🔒 Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
  loggingService.log(`✅ Server ready on port ${port} 🎉🔥`, 'Bootstrap');
}

bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar aplicação:', err);
  process.exit(1);
});
