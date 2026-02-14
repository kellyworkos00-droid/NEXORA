import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById, getUserCount } from '@/app/api/data/auth-store'
import { query } from '@/app/api/data/db'
import { ApiError } from '@/app/api/utils/errors'

// Middleware to check admin role
async function checkAdmin(accessToken: string | undefined) {
  if (!accessToken) {
    throw new ApiError('Unauthorized', 401)
  }

  const payload = verifyToken(accessToken)
  if (!payload) {
    throw new ApiError('Invalid or expired token', 401)
  }

  const user = await findUserById(payload.userId)
  if (!user) {
    throw new ApiError('User not found', 404)
  }

  if (user.role !== 'admin') {
    throw new ApiError('Forbidden: Admin access required', 403)
  }

  return user
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    await checkAdmin(accessToken)

    // Get total users
    const totalUsers = await getUserCount()

    // Get users registered in last 30 days
    const newUsersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL \'30 days\''
    )
    const newUsers = parseInt(newUsersResult.rows[0]?.count || '0')

    // Get verified email count
    const verifiedResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE email_verified = true'
    )
    const verifiedEmails = parseInt(verifiedResult.rows[0]?.count || '0')

    // Get 2FA enabled count
    const twoFactorResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE two_factor_enabled = true'
    )
    const twoFactorUsers = parseInt(twoFactorResult.rows[0]?.count || '0')

    // Get active sessions count
    const sessionsResult = await query(
      'SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()'
    )
    const activeSessions = parseInt(sessionsResult.rows[0]?.count || '0')

    // Get total activities in last 30 days
    const activitiesResult = await query(
      'SELECT COUNT(*) as count FROM activity_logs WHERE created_at > NOW() - INTERVAL \'30 days\''
    )
    const recentActivities = parseInt(activitiesResult.rows[0]?.count || '0')

    // Get recent registrations (last 7 days by day)
    const registrationsResult = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM users 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    // Get most common activities
    const popularActivitiesResult = await query(`
      SELECT action, COUNT(*) as count 
      FROM activity_logs 
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY action 
      ORDER BY count DESC 
      LIMIT 10
    `)

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          newUsers,
          verifiedEmails,
          twoFactorUsers,
          activeSessions,
          recentActivities,
        },
        charts: {
          registrations: registrationsResult.rows,
          popularActivities: popularActivitiesResult.rows,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get admin stats error:', error)
    
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
