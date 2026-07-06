// start application dependencies
import { redis } from "../lib/redis_client.js";

export async function bootstrap(){
  await redis.start();
}