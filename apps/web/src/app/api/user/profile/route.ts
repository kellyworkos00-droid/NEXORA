import { NextRequest, NextResponse } from 'next/server'
import { findUserById, verifyToken, updateUserProfile } from '@/app/api/data/auth-store'
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

    // Get user
    const user = await findUserById(payload.userId)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // Return user profile (exclude sensitive data)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get profile error:', error)
    
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
    const { name, bio, avatarUrl } = body

    // Validate input
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('Name is required')
      }
      if (name.length > 255) {
        throw new ValidationError('Name is too long')
      }
    }

    if (bio !== undefined && typeof bio !== 'string') {
      throw new ValidationError('Bio must be a string')
    }

    if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
      throw new ValidationError('Avatar URL must be a string')
    }

    // Update profile
    const user = await updateUserProfile(payload.userId, {
      name: name?.trim(),
      bio: bio?.trim(),
      avatarUrl: avatarUrl?.trim(),
    })

    if (!user) {
      throw new ApiError('Failed to update profile', 500)
    }

    // Log activity
    await logActivity({
      userId: payload.userId,
      action: ActivityActions.PROFILE_UPDATE,
      description: 'User updated their profile',
      request: req,
    })

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update profile error:', error)
    
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
