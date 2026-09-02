import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../config/redis.js';

export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    prefix = 'rl:'
  } = options;

  let store = undefined;
  const redisClient = getRedisClient();

  if (isRedisConnected() && redisClient) {
    try {
      store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix
      });
    } catch {
      console.warn('Failed to attach RedisStore to rateLimiter, falling back to memory store.');
    }
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      }
    }
  });
}

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  prefix: 'rl:gen:'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  prefix: 'rl:auth:'
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  prefix: 'rl:ai:'
});
