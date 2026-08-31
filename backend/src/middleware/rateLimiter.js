import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

let store = undefined;

if (process.env.REDIS_URI) {
  const redisClient = createClient({ url: process.env.REDIS_URI });
  redisClient.connect().catch(console.error);
  
  // Need to pass the sendCommand function to the store
  store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
  console.log(`\x1b[32m✅ Rate Limiter:\x1b[0m Using Redis Store\x1b[0m`);
} else {
  // Warning if running in production without Redis
  if (process.env.NODE_ENV === 'production') {
    console.warn(`\x1b[33m⚠️  WARNING: Running rate limiter with default MemoryStore in production.\x1b[0m`);
    console.warn(`\x1b[33m   In PM2 Cluster Mode, limits will be per-process and inaccurate.\x1b[0m`);
    console.warn(`\x1b[33m   Set REDIS_URI to enable cluster-safe rate limiting.\x1b[0m`);
  }
}

export const authLimiter = rateLimit({
  store: store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const apiLimiter = rateLimit({
  store: store,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // Limit each IP to 300 requests per 5 minutes
  message: {
    success: false,
    message: 'Too many requests, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
