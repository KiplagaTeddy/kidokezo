import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './_lib/redis.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await redis.set('health:ping', Date.now(), { ex: 60 }); // expires after 60s, so it never clutters the database
    const value = await redis.get('health:ping');
    res.status(200).json({ ok: true, redisReachable: value !== null });
  } catch {
    res.status(500).json({ ok: false, error: 'Redis unreachable' });
  }
}