import { createClient, RedisClientType } from "redis";
import { appConfig } from "../config/app.js";

class RedisCache {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: appConfig.redis,
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
