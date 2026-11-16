import { Redis } from '@upstash/redis';

// Vercel's Upstash integration may name the variables UPSTASH_REDIS_REST_* or KV_REST_API_*,
// so we accept either.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error('Redis env vars missing');
}

export const redis = new Redis({ url, token });