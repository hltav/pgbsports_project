import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { CacheService } from '../cache.service';

@Controller('cache-test')
export class CacheTestController {
  constructor(private readonly cacheService: CacheService) {}

  @Get()
  async get(@Query('key') key: string) {
    const value = await this.cacheService.get(key);
    return { key, value };
  }

  @Get('all')
  async getAll() {
    const keys = await this.cacheService.scanKeys();
    const result: Record<string, unknown> = {};

    for (const key of keys) {
      const value = await this.cacheService.get(key);
      result[key] = value;
    }

    return { count: keys.length, data: result };
  }

  @Post()
  async set(
    @Body('key') key: string,
    @Body('value') value: unknown,
    @Body('ttl') ttl?: number,
  ) {
    await this.cacheService.set(key, value, ttl);
    return { success: true, key, value, ttl };
  }

  @Post('delete')
  async del(@Query('key') key: string) {
    await this.cacheService.del(key);
    return { success: true, key };
  }

  @Post('clear')
  async clear() {
    await this.cacheService.clear();
    return { success: true };
  }
}
