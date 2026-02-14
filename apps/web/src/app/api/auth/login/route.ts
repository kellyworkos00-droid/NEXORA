import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, validatePassword, generateToken } from '@/app/api/data/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = findUserByEmail(email)
    if (!user || !validatePassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const accessToken = generateToken(user.id)
    const refreshToken = generateToken(user.id) // In production, different token

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
