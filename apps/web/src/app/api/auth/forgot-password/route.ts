import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, createPasswordResetToken } from '@/app/api/data/auth-store'
import { sendPasswordResetEmail } from '@/app/api/utils/email'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
import { rateLimit } from '@/app/api/utils/rate-limit'
import { isValidEmail } from '@/app/api/utils/security'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 requests per hour
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`reset:${clientIp}`, { windowMs: 60 * 60 * 1000, maxRequests: 3 })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password reset requests. Please try again later.',
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
    const { email } = body

    // Validate input
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required')
    }

    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }

    // Find user by email
    const user = await findUserByEmail(email.toLowerCase())

    // Always return success to prevent email enumeration
    // (Don't reveal whether email exists)
    if (!user) {
      return NextResponse.json(
        { 
          message: 'If a matching account exists, a password reset link has been sent to your email.',
        },
        { status: 200 }
      )
    }

    // Don't allow password reset for OAuth users
    if (user.oauthProvider) {
      return NextResponse.json(
        { 
          message: 'If a matching account exists, a password reset link has been sent to your email.',
        },
        { status: 200 }
      )
    }

    // Create password reset token
    const token = await createPasswordResetToken(user.id)

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, token, user.name)

    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json(
      { 
        message: 'If a matching account exists, a password reset link has been sent to your email.',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    
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
