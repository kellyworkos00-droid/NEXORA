import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/app/api/data/auth-store'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, message: 'No access token found. Please login.' },
        { status: 200 }
      )
    }

    const payload = verifyToken(accessToken)
    if (!payload) {
      return NextResponse.json(
        { authenticated: false, message: 'Token is invalid or expired. Please login again.' },
        { status: 200 }
      )
    }

    const user = await findUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: 'User not found. Please login again.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        authenticated: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        },
        message: 'You are logged in' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth status check error:', error)
    return NextResponse.json(
      { authenticated: false, message: 'Error checking authentication status' },
      { status: 200 }
    )
  }
}
