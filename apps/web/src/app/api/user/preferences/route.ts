import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/data/auth-store'
import { getUserPreferences, updateUserPreferences } from '@/app/api/utils/user-preferences'
import { ApiError, ValidationError } from '@/app/api/utils/errors'
import { logActivity, ActivityActions } from '@/app/api/utils/activity-logger'

export async function GET(req: NextRequest) {
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

    // Get preferences
    const preferences = await getUserPreferences(payload.userId)

    if (!preferences) {
      throw new ApiError('Failed to get preferences', 500)
    }

    return NextResponse.json(
      { preferences },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get preferences error:', error)
    
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

export async function PATCH(req: NextRequest) {
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
    const { theme, language, timezone, emailNotifications, pushNotifications } = body

    // Validate input
    if (theme !== undefined) {
      if (!['light', 'dark', 'system'].includes(theme)) {
        throw new ValidationError('Invalid theme value')
      }
    }

    if (language !== undefined && typeof language !== 'string') {
      throw new ValidationError('Language must be a string')
    }

    if (timezone !== undefined && typeof timezone !== 'string') {
      throw new ValidationError('Timezone must be a string')
    }

    if (emailNotifications !== undefined && typeof emailNotifications !== 'boolean') {
      throw new ValidationError('Email notifications must be a boolean')
    }

    if (pushNotifications !== undefined && typeof pushNotifications !== 'boolean') {
      throw new ValidationError('Push notifications must be a boolean')
    }

    // Update preferences
    const preferences = await updateUserPreferences(payload.userId, {
      theme,
      language,
      timezone,
      emailNotifications,
      pushNotifications,
    })

    if (!preferences) {
      throw new ApiError('Failed to update preferences', 500)
    }

    // Log activity
    await logActivity({
      userId: payload.userId,
      action: ActivityActions.PREFERENCES_UPDATE,
      description: 'User updated their preferences',
      request: req,
    })

    return NextResponse.json(
      {
        message: 'Preferences updated successfully',
        preferences,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update preferences error:', error)
    
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
