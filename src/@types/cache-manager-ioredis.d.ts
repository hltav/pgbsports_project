declare module 'cache-manager-ioredis' {
  import { StoreConfig, CacheStore } from 'cache-manager';

  function redisStore(config?: StoreConfig): CacheStore;

  export = redisStore;
}
