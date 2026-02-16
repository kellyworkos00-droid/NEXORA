import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/app/api/data/auth-store'
import { query } from '@/app/api/data/db'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or header
    const token = request.cookies.get('access_token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const user = await findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's active sessions
    const result = await query(
      `SELECT id, created_at as "createdAt", expires_at as "expiresAt" 
       FROM sessions 
       WHERE user_id = $1 AND expires_at > NOW() 
       ORDER BY created_at DESC`,
      [user.id]
    )

    const sessions = result.rows.map(row => ({
      id: row.id,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    }))

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
          },
          sessions: {
            active: sessions.length,
            list: sessions,
          },
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Sessions info error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
