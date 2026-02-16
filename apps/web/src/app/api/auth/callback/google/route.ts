import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByOAuth, generateToken, generateRefreshToken, createSession } from '@/app/api/data/auth-store'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for errors from Google
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=No authorization code', request.url)
      )
    }

    // In production: Exchange code for access token with Google's servers
    // For now, we'll create a test flow
    
    // Mock Google user data (in production, fetch from Google with the code)
    const googleUserId = `google-${code.substring(0, 20)}`
    const userEmail = `user-${googleUserId}@nexora.ai`
    const userName = 'Google User'

    let user = await findUserByOAuth('google', googleUserId)
    
    if (!user) {
      user = await createUser(userEmail, userName, undefined, 'google', googleUserId)
    }

    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Create session in database
    await createSession(user.id, refreshToken)

    // Set tokens in cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error: any) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('OAuth callback failed')}`, request.url)
    )
  }
}
