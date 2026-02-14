import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByOAuth, generateToken, generateRefreshToken, createSession } from '@/app/api/data/auth-store'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Check for errors from GitHub
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

    // In production: Exchange code for access token with GitHub's servers
    // For now, we'll create a test flow

    // Mock GitHub user data (in production, fetch from GitHub with the code)
    const githubUserId = `github-${code.substring(0, 20)}`
    const userEmail = `user-${githubUserId}@nexora.ai`
    const userName = 'GitHub User'

    let user = await findUserByOAuth('github', githubUserId)
    
    if (!user) {
      user = await createUser(userEmail, userName, undefined, 'github', githubUserId)
    }

    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Create session in database
    await createSession(user.id, refreshToken)

    // Set tokens in cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error: any) {
    console.error('GitHub OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('OAuth callback failed')}`, request.url)
    )
  }
}
