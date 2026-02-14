import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, verifyToken } from '@/app/api/data/auth-store'
import { logActivity, ActivityActions } from '@/app/api/utils/activity-logger'

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value
    const accessToken = request.cookies.get('accessToken')?.value

    // Log logout activity if we can verify the user
    if (accessToken) {
      const payload = verifyToken(accessToken)
      if (payload) {
        await logActivity({
          userId: payload.userId,
          action: ActivityActions.LOGOUT,
          description: 'User logged out',
          request,
        })
      }
    }

    // Delete session from database if token exists
    if (refreshToken) {
      await deleteSession(refreshToken)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear tokens from cookies
    response.cookies.set('accessToken', '', {
      maxAge: 0,
    })
    response.cookies.set('refreshToken', '', {
      maxAge: 0,
    })

    return response
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
