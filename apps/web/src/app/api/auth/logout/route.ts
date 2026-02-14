import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/app/api/data/auth-store'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value

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
