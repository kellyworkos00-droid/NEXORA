import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, validatePassword, generateToken, generateRefreshToken, createSession, updateLastLogin } from '@/app/api/data/auth-store'
import { rateLimit, getRateLimitHeaders } from '@/app/api/utils/rate-limit'
import { ValidationError, AuthenticationError, RateLimitError, formatErrorResponse, getStatusCode } from '@/app/api/utils/errors'
import { logActivity, ActivityActions } from '@/app/api/utils/activity-logger'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`login:${ip}`, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    })

    if (!rateLimitResult.allowed) {
      throw new RateLimitError('Too many login attempts. Please try again later.', {
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
      })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    const user = await findUserByEmail(email)
    if (!user || !user.password) {
      throw new AuthenticationError('Invalid email or password')
    }

    const isValidPassword = await validatePassword(password, user.password)
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Check if user has 2FA enabled
    if (user.twoFactorEnabled) {
      // Return pending state - require 2FA verification
      return NextResponse.json(
        {
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Two-factor authentication required',
        },
        { 
          status: 200,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Create session in database
    await createSession(user.id, refreshToken)

    // Update last login timestamp
    await updateLastLogin(user.id)

    // Log login activity
    await logActivity({
      userId: user.id,
      action: ActivityActions.LOGIN,
      description: 'User logged in successfully',
      request,
    })

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
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
          },
        },
      },
      { 
        status: 200,
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
    console.error('Login error:', error)
    return NextResponse.json(
      formatErrorResponse(error),
      { status: getStatusCode(error) }
    )
  }
}
