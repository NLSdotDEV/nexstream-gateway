import { redis } from "../../lib/redis_client.js";

export class RedisCacheService {
  public async set(key: string, value: any, ttl: number) {
    await redis.set(key, value, ttl);
  }

  public async get(key: string) {
    return await redis.get(key);
  }

  public ttlToMn(ttl: number) {
    return ttl * 60 * 1000;
  }
}
