import { NextRequest, NextResponse } from 'next/server'
import { findUserById, verifyToken, updateUser2FA } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
import speakeasy from 'speakeasy'

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

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { secret, code } = body

    // Validate input
    if (!secret || typeof secret !== 'string') {
      throw new ValidationError('Secret is required')
    }

    if (!code || typeof code !== 'string') {
      throw new ValidationError('Verification code is required')
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after for clock drift
    })

    if (!verified) {
      throw new ApiError('Invalid verification code', 400)
    }

    // Save secret and enable 2FA
    const success = await updateUser2FA(user.id, secret, true)

    if (!success) {
      throw new ApiError('Failed to enable two-factor authentication', 500)
    }

    return NextResponse.json(
      { 
        message: 'Two-factor authentication enabled successfully',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('2FA enable error:', error)
    
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
