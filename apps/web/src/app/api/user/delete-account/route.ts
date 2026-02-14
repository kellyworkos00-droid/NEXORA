import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById, deleteUserAccount, validatePassword } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
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

    // Get user
    const user = await findUserById(payload.userId)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    const body = await req.json()
    const { password, confirmation } = body

    // Validate confirmation text
    if (confirmation !== 'DELETE') {
      throw new ValidationError('Please type DELETE to confirm account deletion')
    }

    // For non-OAuth users, require password
    if (user.password) {
      if (!password || typeof password !== 'string') {
        throw new ValidationError('Password is required to delete account')
      }

      const isValid = await validatePassword(password, user.password)
      if (!isValid) {
        throw new ApiError('Invalid password', 401)
      }
    }

    // Log account deletion before deleting
    await logActivity({
      userId: payload.userId,
      action: ActivityActions.ACCOUNT_DELETE,
      description: 'User deleted their account',
      request: req,
    })

    // Delete account
    const success = await deleteUserAccount(payload.userId)

    if (!success) {
      throw new ApiError('Failed to delete account', 500)
    }

    // Create response and clear cookies
    const response = NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )

    response.cookies.set('access_token', '', { maxAge: 0 })
    response.cookies.set('refresh_token', '', { maxAge: 0 })

    return response

  } catch (error) {
    console.error('Delete account error:', error)
    
    if (error instanceof ValidationError || error instanceof ApiError) {
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
