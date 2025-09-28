// using redis as a db for now
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redis.on('error', (err) => console.error('Redis error:', err));

let isConnected = false;

export async function getRedis() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
  return redis;
}
export async function disconnectRedis() {
  if (isConnected) {
    await redis.quit();
    isConnected = false;
  }
}