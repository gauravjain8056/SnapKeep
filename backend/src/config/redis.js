import Redis from 'ioredis';
import { config } from './env.js';

let redisClient = null;
let isRedisReady = false;

try {
  redisClient = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) {
        console.warn(`Redis connection failed after ${times} retries. Redis features will run in fallback mode.`);
        return null;
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true,
    connectTimeout: 4000
  });

  redisClient.on('connect', () => {
    isRedisReady = true;
    console.log(`Redis connected successfully to ${config.redisUrl}`);
  });

  redisClient.on('error', (err) => {
    isRedisReady = false;
    console.warn(`Redis connection notice: ${err.message}`);
  });

  redisClient.connect().catch((err) => {
    isRedisReady = false;
    console.warn(`Redis initial connect failed: ${err.message}. Caching and rate limiting will use memory/bypass.`);
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error.message);
  isRedisReady = false;
}

export function getRedisClient() {
  return redisClient;
}

export function isRedisConnected() {
  return isRedisReady && redisClient && redisClient.status === 'ready';
}
