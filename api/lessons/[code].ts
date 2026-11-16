import type { VercelRequest, VercelResponse } from '@vercel/node'
import { redis } from '../_lib/redis.js'
import { normalizeCode } from '../_lib/shareCode.js'
import type { Lesson } from '../../src/lesson.js'
import { isRateLimited } from '../_lib/rateLimit.js'


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Use GET to fetch a lesson.' })
  }
    if (await isRateLimited(req, res, 'fetch', 200, 10 * 60)) return


  const raw = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code
  const code = raw ? normalizeCode(raw) : null
  if (!code) {
    return res
      .status(400)
      .json({ error: 'That code does not look right. Codes have 6 letters and numbers.' })
  }

  try {
    const lesson = await redis.get<Lesson>(`lesson:${code}`)
    if (!lesson) {
      return res
        .status(404)
        .json({ error: 'No lesson found for that code. It may have expired.' })
    }
    return res.status(200).json({ lesson })
  } catch {
    return res.status(500).json({ error: 'Could not load the lesson. Please try again.' })
  }
}