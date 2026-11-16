import { randomInt } from 'node:crypto'

// 31 characters: no 0/O and no 1/I/L, so a code read off a board or screen
// can't be misread.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 6

export function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return code
}

// Accepts "k7m-4pq", "K7M 4PQ" or "K7M4PQ". Returns null if it can't be a real code.
export function normalizeCode(input: string): string | null {
  const code = input.toUpperCase().replace(/[\s-]/g, '')
  if (code.length !== CODE_LENGTH) return null
  for (const ch of code) {
    if (!ALPHABET.includes(ch)) return null
  }
  return code
}

// Codes are shown as K7M-4PQ because short groups are easier to read and type.
export function formatCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`
}
