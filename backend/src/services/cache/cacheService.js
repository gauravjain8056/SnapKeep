import crypto from 'crypto';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';

const memoryCache = new Map();

function hashKey(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

export function getQueryCacheKey(userId, query) {
  const hash = hashKey(query.toLowerCase().trim());
  return `nlq:${userId}:${hash}`;
}

export async function cacheGet(key) {
  const redisClient = getRedisClient();
  if (isRedisConnected() && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`Redis get failed for key ${key}:`, err.message);
    }
  }

  const item = memoryCache.get(key);
  if (item && item.expiresAt > Date.now()) {
    return item.value;
  } else if (item) {
    memoryCache.delete(key);
  }
  return null;
}

export async function cacheSet(key, value, ttlSeconds = 600) {
  const redisClient = getRedisClient();
  if (isRedisConnected() && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.warn(`Redis set failed for key ${key}:`, err.message);
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
  return true;
}

export async function invalidatePattern(pattern) {
  const redisClient = getRedisClient();
  if (isRedisConnected() && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      console.warn(`Redis invalidate failed for pattern ${pattern}:`, err.message);
    }
  }
  memoryCache.clear();
}
