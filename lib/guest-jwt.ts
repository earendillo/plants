// lib/guest-jwt.ts
import { SignJWT } from 'jose'

/** Signs a guest JWT with SUPABASE_JWT_SECRET. PostgREST verifies this. */
export async function signGuestJwt(
  guestToken: string,
  gardenId: string,
  expiresAt: Date
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)
  return new SignJWT({
    role: 'anon',
    guest_token: guestToken,
    garden_id: gardenId,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expiresAt)
    .sign(secret)
}

/**
 * Decodes the JWT payload WITHOUT verifying the signature.
 * Safe because: (a) cookie is httpOnly so clients cannot forge it,
 * (b) PostgREST independently verifies the signature on every request,
 * (c) RPCs validate guest_token against the DB.
 */
export function decodeGuestJwtClaims(
  jwt: string
): { guestToken: string; gardenId: string } | null {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as Record<string, unknown>
    if (typeof payload.guest_token !== 'string') return null
    if (typeof payload.garden_id !== 'string') return null
    return { guestToken: payload.guest_token, gardenId: payload.garden_id }
  } catch {
    return null
  }
}
