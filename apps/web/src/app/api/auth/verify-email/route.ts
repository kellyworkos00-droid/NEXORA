import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken, generateToken, generateRefreshToken, createSession } from '@/app/api/data/auth-store'
import { ApiError } from '@/app/api/utils/errors'

export async function GET(req: NextRequest) {
  try {
    // Get token from query parameters
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      throw new ApiError('Verification token is required', 400)
    }

    // Verify email token
    const user = await verifyEmailToken(token)

    if (!user) {
      throw new ApiError('Invalid or expired verification token', 400)
    }

    // Generate new tokens
    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Create session
    await createSession(user.id, refreshToken)

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL('/dashboard?verified=true', req.url),
      { status: 302 }
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
    console.error('Email verification error:', error)
    
    if (error instanceof ApiError) {
      // Redirect to error page with message
      return NextResponse.redirect(
        new URL(`/verify-email-error?message=${encodeURIComponent(error.message)}`, req.url),
        { status: 302 }
      )
    }

    return NextResponse.redirect(
      new URL('/verify-email-error?message=Internal%20server%20error', req.url),
      { status: 302 }
    )
  }
}
