import { query } from '../data/db'

export interface UserPreferences {
  userId: string
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  createdAt?: Date
  updatedAt?: Date
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const result = await query(
      `SELECT user_id as "userId", theme, language, timezone, 
              email_notifications as "emailNotifications",
              push_notifications as "pushNotifications",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM user_preferences
       WHERE user_id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      // Create default preferences if none exist
      return await createUserPreferences(userId)
    }

    return result.rows[0]
  } catch (error) {
    console.error('Failed to get user preferences:', error)
    return null
  }
}

export async function createUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const result = await query(
      `INSERT INTO user_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING user_id as "userId", theme, language, timezone,
                 email_notifications as "emailNotifications",
                 push_notifications as "pushNotifications",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [userId]
    )

    return result.rows[0]
  } catch (error) {
    console.error('Failed to create user preferences:', error)
    throw error
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserPreferences | null> {
  try {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (preferences.theme !== undefined) {
      updates.push(`theme = $${paramIndex++}`)
      values.push(preferences.theme)
    }
    if (preferences.language !== undefined) {
      updates.push(`language = $${paramIndex++}`)
      values.push(preferences.language)
    }
    if (preferences.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`)
      values.push(preferences.timezone)
    }
    if (preferences.emailNotifications !== undefined) {
      updates.push(`email_notifications = $${paramIndex++}`)
      values.push(preferences.emailNotifications)
    }
    if (preferences.pushNotifications !== undefined) {
      updates.push(`push_notifications = $${paramIndex++}`)
      values.push(preferences.pushNotifications)
    }

    if (updates.length === 0) {
      return await getUserPreferences(userId)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const result = await query(
      `UPDATE user_preferences
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex}
       RETURNING user_id as "userId", theme, language, timezone,
                 email_notifications as "emailNotifications",
                 push_notifications as "pushNotifications",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      values
    )

    if (result.rows.length === 0) {
      // Create if doesn't exist
      await createUserPreferences(userId)
      return await updateUserPreferences(userId, preferences)
    }

    return result.rows[0]
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    return null
  }
}
