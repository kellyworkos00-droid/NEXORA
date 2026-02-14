import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
import { validatePasswordStrength } from '@/app/api/utils/security'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = body

    // Validate input
    if (!token || typeof token !== 'string') {
      throw new ValidationError('Reset token is required')
    }

    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required')
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message || 'Invalid password')
    }

    // Reset password
    const success = await resetPassword(token, password)

    if (!success) {
      throw new ApiError('Invalid or expired reset token', 400)
    }

    return NextResponse.json(
      { 
        message: 'Password has been reset successfully. Please log in with your new password.',
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    
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
