import { query } from '../data/db'
import { NextRequest } from 'next/server'

export interface ActivityLogData {
  userId: string
  action: string
  description?: string
  metadata?: Record<string, any>
  request?: NextRequest
}

export async function logActivity(data: ActivityLogData): Promise<void> {
  try {
    const { userId, action, description, metadata, request } = data

    // Extract IP and user agent from request if provided
    let ipAddress: string | null = null
    let userAgent: string | null = null

    if (request) {
      ipAddress = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  null
      userAgent = request.headers.get('user-agent') || null
    }

    await query(
      `INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        action,
        description || null,
        ipAddress,
        userAgent,
        metadata ? JSON.stringify(metadata) : null,
      ]
    )
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - activity logging should not break the main flow
  }
}

export async function getActivityLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    const result = await query(
      `SELECT id, action, description, ip_address, user_agent, metadata, created_at
       FROM activity_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )

    return result.rows.map(row => ({
      id: row.id,
      action: row.action,
      description: row.description,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      metadata: row.metadata,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error('Failed to get activity logs:', error)
    return []
  }
}

export async function getRecentActivity(userId: string, days: number = 30): Promise<any[]> {
  try {
    const result = await query(
      `SELECT action, COUNT(*) as count, MAX(created_at) as last_occurrence
       FROM activity_logs
       WHERE user_id = $1 
       AND created_at > NOW() - INTERVAL '${days} days'
       GROUP BY action
       ORDER BY count DESC`,
      [userId]
    )

    return result.rows
  } catch (error) {
    console.error('Failed to get recent activity:', error)
    return []
  }
}

// Activity action constants
export const ActivityActions = {
  // Authentication
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  REGISTER: 'user.register',
  PASSWORD_RESET_REQUEST: 'user.password_reset.request',
  PASSWORD_RESET_COMPLETE: 'user.password_reset.complete',
  EMAIL_VERIFY: 'user.email.verify',
  
  // Two-Factor Authentication
  TWO_FACTOR_ENABLE: 'user.2fa.enable',
  TWO_FACTOR_DISABLE: 'user.2fa.disable',
  TWO_FACTOR_VERIFY: 'user.2fa.verify',
  
  // Profile
  PROFILE_UPDATE: 'user.profile.update',
  AVATAR_UPDATE: 'user.avatar.update',
  PASSWORD_CHANGE: 'user.password.change',
  
  // Settings
  PREFERENCES_UPDATE: 'user.preferences.update',
  EMAIL_CHANGE: 'user.email.change',
  
  // Sessions
  SESSION_CREATE: 'user.session.create',
  SESSION_DELETE: 'user.session.delete',
  SESSION_DELETE_ALL: 'user.session.delete_all',
  
  // Account
  ACCOUNT_DELETE: 'user.account.delete',
} as const
