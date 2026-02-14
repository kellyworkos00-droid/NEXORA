import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, changeUserPassword } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
import { validatePasswordStrength } from '@/app/api/utils/security'
import { logActivity, ActivityActions } from '@/app/api/utils/activity-logger'

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

    const body = await req.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || typeof currentPassword !== 'string') {
      throw new ValidationError('Current password is required')
    }

    if (!newPassword || typeof newPassword !== 'string') {
      throw new ValidationError('New password is required')
    }

    if (currentPassword === newPassword) {
      throw new ValidationError('New password must be different from current password')
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message || 'Invalid password')
    }

    // Change password
    const success = await changeUserPassword(payload.userId, currentPassword, newPassword)

    if (!success) {
      throw new ApiError('Current password is incorrect', 401)
    }

    // Log activity
    await logActivity({
      userId: payload.userId,
      action: ActivityActions.PASSWORD_CHANGE,
      description: 'User changed their password',
      request: req,
    })

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Change password error:', error)
    
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
