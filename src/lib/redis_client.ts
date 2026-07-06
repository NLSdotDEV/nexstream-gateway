import { createClient, RedisClientType } from "redis";

class RedisCache {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: "redis://localhost:6001",
    });
  }

  async start() {
    await this.client.connect();
  }

  async set(key: string, value: any, ttl: number) {
    await this.client.set(key, value, {
      expiration: {
        type: "PX",
        value: ttl,
      },
    });
  }

  async get(key: string) {
    return await this.client.get(key);
  }
}

export const redis = new RedisCache();
