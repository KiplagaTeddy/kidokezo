import type { VercelRequest, VercelResponse } from '@vercel/node'
import { redis } from '../_lib/redis.js'
import { generateCode, formatCode } from '../_lib/shareCode.js'
import { validateLesson } from '../../shared/lessonSchema.js'
import { isRateLimited } from '../_lib/rateLimit.js'

const TTL_DAYS = 90
const TTL_SECONDS = 60 * 60 * 24 * TTL_DAYS

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Use POST to share a lesson.' })
  }

    if (await isRateLimited(req, res, 'publish', 20, 60 * 60)) return

  let body: unknown = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'The request was not valid JSON.' })
    }
  }

  const check = validateLesson((body as { lesson?: unknown } | null)?.lesson)
  if (!check.ok) {
    return res.status(400).json({ error: check.error })
  }

  try {
    // Retry a few times in the very unlikely event the random code is already taken.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode()
      // nx = "only set if this key does not exist yet", so we can never
      // overwrite someone else's lesson. ex = expire after TTL_SECONDS.
      const saved = await redis.set(`lesson:${code}`, check.lesson, {
        nx: true,
        ex: TTL_SECONDS,
      })
      if (saved === 'OK') {
        return res
          .status(201)
          .json({ code, display: formatCode(code), expiresInDays: TTL_DAYS })
      }
    }
    return res.status(503).json({ error: 'Could not make a code. Please try again.' })
  } catch {
    return res.status(500).json({ error: 'Could not save the lesson. Please try again.' })
  }
}