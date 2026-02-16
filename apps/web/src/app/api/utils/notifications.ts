import { query } from '../data/db'

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Date
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  link?: string
): Promise<Notification | null> {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", type, title, message, link, read, created_at as "createdAt"`,
      [userId, type, title, message, link || null]
    )

    return result.rows[0]
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

export async function createBroadcastNotification(
  type: Notification['type'],
  title: string,
  message: string,
  link?: string
): Promise<number> {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       SELECT id, $1, $2, $3, $4 FROM users`,
      [type, title, message, link || null]
    )

    return result.rowCount ?? 0
  } catch (error) {
    console.error('Failed to create broadcast notifications:', error)
    return 0
  }
}

export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  try {
    const whereClause = unreadOnly ? 'user_id = $1 AND read = FALSE' : 'user_id = $1'
    
    const result = await query(
      `SELECT id, user_id as "userId", type, title, message, link, read, created_at as "createdAt"
       FROM notifications
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )

    return result.rows
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    )

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return false
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [userId]
    )

    return true
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return false
  }
}

export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    )

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return false
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE',
      [userId]
    )

    return parseInt(result.rows[0]?.count || '0')
  } catch (error) {
    console.error('Failed to get unread count:', error)
    return 0
  }
}

export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
  try {
    const result = await query(
      `DELETE FROM notifications 
       WHERE read = TRUE 
       AND created_at < NOW() - INTERVAL '${daysOld} days'`
    )

    return result.rowCount ?? 0
  } catch (error) {
    console.error('Failed to delete old notifications:', error)
    return 0
  }
}

// Notification Templates
export const NotificationTemplates = {
  WELCOME: (name: string) => ({
    type: 'success' as const,
    title: 'Welcome to NEXORA!',
    message: `Hi ${name}! Your account has been created successfully. Start exploring the platform.`,
    link: '/dashboard',
  }),

  EMAIL_VERIFIED: () => ({
    type: 'success' as const,
    title: 'Email Verified',
    message: 'Your email address has been successfully verified.',
  }),

  PASSWORD_CHANGED: () => ({
    type: 'info' as const,
    title: 'Password Changed',
    message: 'Your password has been changed successfully. All other sessions have been logged out.',
  }),

  TWO_FACTOR_ENABLED: () => ({
    type: 'success' as const,
    title: '2FA Enabled',
    message: 'Two-factor authentication has been enabled for your account.',
    link: '/settings/security',
  }),

  TWO_FACTOR_DISABLED: () => ({
    type: 'warning' as const,
    title: '2FA Disabled',
    message: 'Two-factor authentication has been disabled for your account.',
    link: '/settings/security',
  }),

  NEW_LOGIN: (device: string, location: string) => ({
    type: 'info' as const,
    title: 'New Login Detected',
    message: `New login from ${device} in ${location}. If this wasn't you, secure your account immediately.`,
    link: '/settings/sessions',
  }),

  SUSPICIOUS_ACTIVITY: () => ({
    type: 'warning' as const,
    title: 'Suspicious Activity Detected',
    message: 'We detected unusual activity on your account. Please review your recent sessions.',
    link: '/settings/sessions',
  }),

  PROFILE_UPDATED: () => ({
    type: 'success' as const,
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully.',
  }),

  SESSION_TERMINATED: (count: number) => ({
    type: 'info' as const,
    title: 'Sessions Terminated',
    message: `${count} session${count > 1 ? 's have' : ' has'} been terminated.`,
  }),
}
