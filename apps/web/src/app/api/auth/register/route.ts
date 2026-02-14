import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, createUser, generateToken } from '@/app/api/data/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, confirmPassword } = await request.json()

    if (!email || !name || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const user = createUser(email, name, password)
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
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
