import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

type RedisValue =
  | string
  | Record<string, string> // hash
  | string[];

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    const redisUrl =
      this.configService.get<string>('REDIS_PUBLIC_URL') ||
      this.configService.get<string>('REDIS_URL') ||
      'redis://localhost:6379';

    this.client = createClient({
      url: redisUrl,
      socket: {
        keepAlive: true,
        reconnectStrategy: (retries) => {
          return Math.min(retries * 100, 5000);
        },
        connectTimeout: 10000, // 10 segundos para o handshake inicial
      },
    });

    // 3. Melhorando o log de erro para não poluir se for apenas reconexão
    this.client.on('error', (err: unknown) => {
      // Corrigido: Type Guard para acessar .code com segurança
      const errorWithCode = err as { code?: string; message?: string };

      if (errorWithCode.code === 'ECONNRESET') {
        this.logger.warn(
          'Redis: Conexão resetada pelo servidor. Tentando reconectar...',
        );
      } else {
        this.logger.error('Redis Client Error', err);
      }
    });
  }

  async onModuleInit() {
    // Aqui podemos usar await sem erro de ESLint
    await this.client.connect();
    this.logger.log('✅ Redis conectado com sucesso');
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : undefined;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, { EX: ttlSeconds });
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushDb();
    this.logger.log(`♻️ Cache cleared`);
  }

  async scanKeys(pattern = '*'): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const reply = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = reply.cursor;
      keys.push(...reply.keys);
    } while (cursor !== '0');

    this.logger.log(
      `🔍 Scan keys com pattern "${pattern}" -> Total: ${keys.length}`,
    );
    return keys;
  }
  async readKey(key: string): Promise<RedisValue | null> {
    const type = await this.client.type(key);

    switch (type) {
      case 'string':
        return await this.client.get(key);
      case 'hash':
        return await this.client.hGetAll(key);
      case 'list':
        return await this.client.lRange(key, 0, -1);
      case 'set':
        return await this.client.sMembers(key);
      case 'zset':
        return await this.client.zRange(key, 0, -1);
      default:
        return null;
    }
  }

  async getAll(
    pattern = '*',
  ): Promise<{ key: string; type: string; value: any }[]> {
    const keys = await this.scanKeys(pattern);
    const results: { key: string; type: string; value: any }[] = [];

    for (const key of keys) {
      const type = await this.client.type(key);
      const value = await this.readKey(key); // usa o comando certo
      results.push({ key, type, value });
    }

    return results;
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, {
      NX: true,
      EX: ttlSeconds,
    });

    return result === 'OK';
  }
}
