import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

// Disable caching for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Read the auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      const response = NextResponse.json(
        { error: 'Not authenticated - no token' },
        { status: 401 }
      )
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      return response
    }

    // Verify the token
    const payload = verifyToken(token)
    
    if (!payload) {
      const response = NextResponse.json(
        { error: 'Not authenticated - invalid token' },
        { status: 401 }
      )
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      return response
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
      },
    })
    
    // Prevent caching of auth responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    
    return response

  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    )
  }
}

