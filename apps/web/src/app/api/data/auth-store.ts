import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { query } from './db'

// Secure password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export interface User {
  id: string
  email: string
  name: string
  password?: string
  oauthProvider?: string
  oauthId?: string
  avatarUrl?: string
  bio?: string
  role?: string
  emailVerified?: boolean
  twoFactorSecret?: string
  twoFactorEnabled?: boolean
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface Session {
  id: string
  userId: string
  refreshToken: string
  expiresAt: Date
  createdAt: Date
}

// Database-backed user operations with fallback to demo user
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@nexora.ai',
  name: 'Demo User',
  password: bcrypt.hashSync('password123', 10),
  createdAt: new Date().toISOString(),
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const normalizedEmail = email.toLowerCase()
    
    // Check demo user first
    if (normalizedEmail === DEMO_USER.email) {
      return DEMO_USER
    }

    const result = await query(
      'SELECT id, email, name, password_hash as password, oauth_provider as "oauthProvider", oauth_id as "oauthId", avatar_url as "avatarUrl", bio, role, email_verified as "emailVerified", two_factor_secret as "twoFactorSecret", two_factor_enabled as "twoFactorEnabled", created_at as "createdAt", last_login_at as "lastLoginAt" FROM users WHERE email = $1',
      [normalizedEmail]
    )
    
    if (result.rows.length === 0) return undefined
    
    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      oauthProvider: row.oauthProvider,
      oauthId: row.oauthId,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      role: row.role,
      emailVerified: row.emailVerified,
      twoFactorSecret: row.twoFactorSecret,
      twoFactorEnabled: row.twoFactorEnabled,
      createdAt: row.createdAt,
      lastLoginAt: row.lastLoginAt,
    }
  } catch (error) {
    console.error('Error finding user by email:', error)
    // Fallback to demo user
    if (email.toLowerCase() === DEMO_USER.email) {
      return DEMO_USER
    }
    return undefined
  }
}

export async function findUserById(id: string): Promise<User | undefined> {
  try {
    // Check demo user first
    if (id === DEMO_USER.id) {
      return DEMO_USER
    }

    const result = await query(
      'SELECT id, email, name, password_hash as password, oauth_provider as "oauthProvider", oauth_id as "oauthId", avatar_url as "avatarUrl", bio, role, email_verified as "emailVerified", two_factor_secret as "twoFactorSecret", two_factor_enabled as "twoFactorEnabled", created_at as "createdAt", last_login_at as "lastLoginAt" FROM users WHERE id = $1',
      [id]
    )
    
    if (result.rows.length === 0) return undefined
    
    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      oauthProvider: row.oauthProvider,
      oauthId: row.oauthId,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      role: row.role,
      emailVerified: row.emailVerified,
      twoFactorSecret: row.twoFactorSecret,
      twoFactorEnabled: row.twoFactorEnabled,
      createdAt: row.createdAt,
      lastLoginAt: row.lastLoginAt,
    }
  } catch (error) {
    console.error('Error finding user by id:', error)
    // Fallback to demo user
    if (id === DEMO_USER.id) {
      return DEMO_USER
    }
    return undefined
  }
}

export async function findUserByOAuth(provider: string, oauthId: string): Promise<User | undefined> {
  try {
    const result = await query(
      'SELECT id, email, name, password_hash as password, oauth_provider as "oauthProvider", oauth_id as "oauthId", avatar_url as "avatarUrl", bio, role, email_verified as "emailVerified", two_factor_secret as "twoFactorSecret", two_factor_enabled as "twoFactorEnabled", created_at as "createdAt", last_login_at as "lastLoginAt" FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [provider, oauthId]
    )
    
    if (result.rows.length === 0) return undefined
    
    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      oauthProvider: row.oauthProvider,
      oauthId: row.oauthId,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      role: row.role,
      emailVerified: row.emailVerified,
      twoFactorSecret: row.twoFactorSecret,
      twoFactorEnabled: row.twoFactorEnabled,
      createdAt: row.createdAt,
      lastLoginAt: row.lastLoginAt,
    }
  } catch (error) {
    console.error('Error finding user by OAuth:', error)
    return undefined
  }
}

export async function createUser(
  email: string,
  name: string,
  password?: string,
  oauthProvider?: string,
  oauthId?: string
): Promise<User> {
  try {
    const normalizedEmail = email.toLowerCase()
    const passwordHash = password ? await hashPassword(password) : null

    const result = await query(
      `INSERT INTO users (email, name, password_hash, oauth_provider, oauth_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, password_hash as password, oauth_provider as "oauthProvider", oauth_id as "oauthId", created_at as "createdAt"`,
      [normalizedEmail, name, passwordHash, oauthProvider || null, oauthId || null]
    )

    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      oauthProvider: row.oauthProvider,
      oauthId: row.oauthId,
      createdAt: row.createdAt,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const setClauses: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.name) {
      setClauses.push(`name = $${paramCount++}`)
      values.push(updates.name)
    }
    if (updates.email) {
      setClauses.push(`email = $${paramCount++}`)
      values.push(updates.email.toLowerCase())
    }
    if (updates.password) {
      setClauses.push(`password_hash = $${paramCount++}`)
      values.push(await hashPassword(updates.password))
    }

    if (setClauses.length === 0) {
      const user = await findUserById(id)
      return user || null
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, name, password_hash as password, oauth_provider as "oauthProvider", oauth_id as "oauthId", created_at as "createdAt", updated_at as "updatedAt"`,
      values
    )

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      oauthProvider: row.oauthProvider,
      oauthId: row.oauthId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

export async function validatePassword(plainPassword: string, storedPassword: string): Promise<boolean> {
  // Compare hashed password with bcrypt
  return bcrypt.compare(plainPassword, storedPassword)
}

// Session Management Functions

export async function createSession(userId: string, refreshToken: string): Promise<Session | null> {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

    const result = await query(
      `INSERT INTO sessions (user_id, refresh_token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING id, user_id as "userId", refresh_token as "refreshToken", expires_at as "expiresAt", created_at as "createdAt"`,
      [userId, refreshToken, expiresAt]
    )

    const row = result.rows[0]
    return {
      id: row.id,
      userId: row.userId,
      refreshToken: row.refreshToken,
      expiresAt: new Date(row.expiresAt),
      createdAt: new Date(row.createdAt),
    }
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

export async function findSessionByToken(refreshToken: string): Promise<Session | null> {
  try {
    const result = await query(
      `SELECT id, user_id as "userId", refresh_token as "refreshToken", expires_at as "expiresAt", created_at as "createdAt" 
       FROM sessions 
       WHERE refresh_token = $1 AND expires_at > NOW()`,
      [refreshToken]
    )

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id,
      userId: row.userId,
      refreshToken: row.refreshToken,
      expiresAt: new Date(row.expiresAt),
      createdAt: new Date(row.createdAt),
    }
  } catch (error) {
    console.error('Error finding session:', error)
    return null
  }
}

export async function deleteSession(refreshToken: string): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM sessions WHERE refresh_token = $1',
      [refreshToken]
    )
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
}

export async function deleteUserSessions(userId: string): Promise<boolean> {
  try {
    await query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userId]
    )
    return true
  } catch (error) {
    console.error('Error deleting user sessions:', error)
    return false
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await query(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    )
    return result.rowCount ?? 0
  } catch (error) {
    console.error('Error cleaning up sessions:', error)
    return 0
  }
}

// Token Generation and Verification

export function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })
  ).toString('base64')
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'secret-key')
    .update(`${header}.${payload}`)
    .digest('base64')
  return `${header}.${payload}.${signature}`
}

export function generateRefreshToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      type: 'refresh',
    })
  ).toString('base64')
  const signature = crypto
    .createHmac('sha256', process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64')
  return `${header}.${payload}.${signature}`
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const [header, payload, signature] = token.split('.')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'secret-key')
      .update(`${header}.${payload}`)
      .digest('base64')

    if (signature !== expectedSignature) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    return { userId: decoded.userId }
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const [header, payload, signature] = token.split('.')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key')
      .update(`${header}.${payload}`)
      .digest('base64')

    if (signature !== expectedSignature) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
    if (decoded.type !== 'refresh' || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return { userId: decoded.userId }
  } catch {
    return null
  }
}

// Email Verification Functions
export async function createVerificationToken(userId: string): Promise<string> {
  try {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    await query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    )
    
    return token
  } catch (error) {
    console.error('Error creating verification token:', error)
    throw error
  }
}

export async function verifyEmailToken(token: string): Promise<User | null> {
  try {
    // Find token and check expiration
    const tokenResult = await query(
      'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1',
      [token]
    )
    
    if (tokenResult.rows.length === 0) {
      return null // Token not found
    }
    
    const { user_id, expires_at } = tokenResult.rows[0]
    
    if (new Date(expires_at) < new Date()) {
      // Token expired, delete it
      await query('DELETE FROM email_verification_tokens WHERE token = $1', [token])
      return null
    }
    
    // Update user's email_verified status
    await query(
      'UPDATE users SET email_verified = TRUE WHERE id = $1',
      [user_id]
    )
    
    // Delete the used token
    await query('DELETE FROM email_verification_tokens WHERE token = $1', [token])
    
    // Return updated user
    return await findUserById(user_id) || null
  } catch (error) {
    console.error('Error verifying email token:', error)
    return null
  }
}

// Password Reset Functions
export async function createPasswordResetToken(userId: string): Promise<string> {
  try {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    )
    
    return token
  } catch (error) {
    console.error('Error creating password reset token:', error)
    throw error
  }
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    const result = await query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1',
      [token]
    )
    
    if (result.rows.length === 0) {
      return null // Token not found
    }
    
    const { user_id, expires_at, used } = result.rows[0]
    
    if (used) {
      return null // Token already used
    }
    
    if (new Date(expires_at) < new Date()) {
      // Token expired
      await query('DELETE FROM password_reset_tokens WHERE token = $1', [token])
      return null
    }
    
    return user_id
  } catch (error) {
    console.error('Error verifying password reset token:', error)
    return null
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const userId = await verifyPasswordResetToken(token)
    
    if (!userId) {
      return false
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword)
    
    // Update user's password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    )
    
    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
      [token]
    )
    
    // Delete all sessions for this user (force re-login)
    await deleteUserSessions(userId)
    
    return true
  } catch (error) {
    console.error('Error resetting password:', error)
    return false
  }
}

// Two-Factor Authentication Functions
export async function updateUser2FA(userId: string, secret: string | null, enabled: boolean): Promise<boolean> {
  try {
    await query(
      'UPDATE users SET two_factor_secret = $1, two_factor_enabled = $2 WHERE id = $3',
      [secret, enabled, userId]
    )
    return true
  } catch (error) {
    console.error('Error updating 2FA:', error)
    return false
  }
}

// Profile Management Functions
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; bio?: string; avatarUrl?: string }
): Promise<User | null> {
  try {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`)
      values.push(updates.bio)
    }
    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`)
      values.push(updates.avatarUrl)
    }

    if (fields.length === 0) {
      const user = await findUserById(userId)
      return user ?? null
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    const user = await findUserById(userId)
    return user ?? null
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const user = await findUserById(userId)
    if (!user || !user.password) {
      return false
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return false
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    )

    // Delete all sessions except the current one (force re-login on other devices)
    await query(
      'DELETE FROM sessions WHERE user_id = $1 AND created_at < NOW() - INTERVAL \'1 minute\'',
      [userId]
    )

    return true
  } catch (error) {
    console.error('Error changing password:', error)
    return false
  }
}

export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    )
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    // Delete user (CASCADE will delete sessions, tokens, etc.)
    await query('DELETE FROM users WHERE id = $1', [userId])
    return true
  } catch (error) {
    console.error('Error deleting user account:', error)
    return false
  }
}

// Admin Functions
export async function getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
  try {
    const result = await query(
      `SELECT id, email, name, avatar_url as "avatarUrl", bio, role, email_verified as "emailVerified",
              two_factor_enabled as "twoFactorEnabled", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return result.rows
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

export async function getUserCount(): Promise<number> {
  try {
    const result = await query('SELECT COUNT(*) as count FROM users')
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error('Error getting user count:', error)
    return 0
  }
}

export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  try {
    await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [role, userId]
    )
    return true
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}
