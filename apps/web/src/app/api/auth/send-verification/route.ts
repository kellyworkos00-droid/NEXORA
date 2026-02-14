import { NextRequest, NextResponse } from 'next/server'
import { findUserById, createVerificationToken } from '@/app/api/data/auth-store'
import { sendVerificationEmail } from '@/app/api/utils/email'
import { verifyToken } from '@/app/api/data/auth-store'
import { ApiError } from '@/app/api/utils/errors'
import { rateLimit } from '@/app/api/utils/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 requests per hour
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`verify:${clientIp}`, { windowMs: 60 * 60 * 1000, maxRequests: 3 })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many verification emails sent. Please try again later.',
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

    // Get access token from cookie
    const accessToken = req.cookies.get('access_token')?.value

    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    // Verify token
    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    // Get user
    const user = await findUserById(payload.userId)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      )
    }

    // Create verification token
    const token = await createVerificationToken(user.id)

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, token, user.name)

    if (!emailSent) {
      throw new ApiError('Failed to send verification email', 500)
    }

    return NextResponse.json(
      { 
        message: 'Verification email sent successfully',
        email: user.email 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Send verification error:', error)
    
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
