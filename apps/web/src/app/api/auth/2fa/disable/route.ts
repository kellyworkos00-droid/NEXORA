import { NextRequest, NextResponse } from 'next/server'
import { findUserById, verifyToken, updateUser2FA, validatePassword } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'

export async function POST(req: NextRequest) {
  try {
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

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { password } = body

    // Validate input (require password for security)
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required to disable 2FA')
    }

    // Verify password
    if (!user.password) {
      throw new ApiError('Cannot verify password for OAuth user', 400)
    }
    
    const isValidPassword = await validatePassword(password, user.password)
    if (!isValidPassword) {
      throw new ApiError('Invalid password', 401)
    }

    // Disable 2FA
    const success = await updateUser2FA(user.id, null, false)

    if (!success) {
      throw new ApiError('Failed to disable two-factor authentication', 500)
    }

    return NextResponse.json(
      { 
        message: 'Two-factor authentication disabled successfully',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('2FA disable error:', error)
    
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
