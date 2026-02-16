import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, createUser, generateToken, generateRefreshToken, createSession } from '@/app/api/data/auth-store'
import { rateLimit, getRateLimitHeaders } from '@/app/api/utils/rate-limit'
import { ValidationError, ConflictError, RateLimitError, formatErrorResponse, getStatusCode } from '@/app/api/utils/errors'
import { logActivity, ActivityActions } from '@/app/api/utils/activity-logger'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registration attempts per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`register:${ip}`, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
    })

    if (!rateLimitResult.allowed) {
      throw new RateLimitError('Too many registration attempts. Please try again later.', {
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
      })
    }

    const { email, name, password, confirmPassword } = await request.json()

    if (!email || !name || !password || !confirmPassword) {
      throw new ValidationError('All fields are required')
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match')
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters')
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format')
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const user = await createUser(email, name, password)
    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Create session in database
    await createSession(user.id, refreshToken)

    // Log registration activity
    await logActivity({
      userId: user.id,
      action: ActivityActions.REGISTER,
      description: 'User registered successfully',
      request,
    })
    await createSession(user.id, refreshToken)

    const response = NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      },
      { 
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )

    // Set tokens in HTTP-only cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      formatErrorResponse(error),
      { status: getStatusCode(error) }
    )
  }
}
