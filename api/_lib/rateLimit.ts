import { createHash } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { redis } from './redis.js'

// Vercel sets x-forwarded-for to the real client address.
// We store only a hash of it, never the address itself.
function clientId(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
    ?.split(',')[0]
    ?.trim()
  const ip = first || (req.headers['x-real-ip'] as string | undefined) || 'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

// Returns true if the request was refused (a 429 has already been sent,
// so the handler should just `return`).
export async function isRateLimited(
  req: VercelRequest,
  res: VercelResponse,
  scope: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const windowId = Math.floor(now / windowSeconds)
    const key = `rl:${scope}:${clientId(req)}:${windowId}`

    // One round trip: add 1, and make sure the key expires.
    const [count] = await redis
      .pipeline()
      .incr(key)
      .expire(key, windowSeconds)
      .exec<[number, number]>()

    if (count > limit) {
      const retryAfter = (windowId + 1) * windowSeconds - now
      res.setHeader('Retry-After', String(retryAfter))
      res.status(429).json({
        error: `Too many requests. Please wait ${Math.ceil(retryAfter / 60)} minute(s) and try again.`,
      })
      return true
    }
    return false
  } catch {
    // The limiter is a guard, not the feature. If it breaks, let the request
    // through: the real Redis call after it will fail visibly if Redis is down.
    return false
  }
}