import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  return token?.value || null
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies()
  if (!token) return null
  return verifyToken(token)
}

