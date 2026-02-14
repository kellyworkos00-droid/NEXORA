import { NextRequest, NextResponse } from 'next/server'
import { findUserById, generateToken, generateRefreshToken, createSession } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
import { rateLimit } from '@/app/api/utils/rate-limit'
import speakeasy from 'speakeasy'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`2fa:${clientIp}`, { windowMs: 15 * 60 * 1000, maxRequests: 5 })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many verification attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      )
    }

    const body = await req.json()
    const { userId, code } = body

    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('User ID is required')
    }

    if (!code || typeof code !== 'string') {
      throw new ValidationError('Verification code is required')
    }

    // Get user
    const user = await findUserById(userId)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new ApiError('Two-factor authentication is not enabled', 400)
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after for clock drift
    })

    if (!verified) {
      throw new ApiError('Invalid verification code', 401)
    }

    // Generate tokens
    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Create session
    await createSession(user.id, refreshToken)

    // Create response
    const response = NextResponse.json(
      {
        message: 'Two-factor authentication successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
      { status: 200 }
    )

    // Set secure HTTP-only cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('2FA verify error:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
