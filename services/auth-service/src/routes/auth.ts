import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { logger } from '../utils/logger'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  tenantName: z.string().min(2).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

/**
 * Register new user and tenant
 * POST /auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body)
    
    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [body.email]
    )
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10)
    
    // Create tenant
    const tenantName = body.tenantName || `${body.name}'s Organization`
    const tenantSubdomain = body.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    
    const tenantResult = await db.query(
      `INSERT INTO tenants (id, name, subdomain, plan, status, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), tenantName, tenantSubdomain, 'free', 'active', JSON.stringify({})]
    )
    
    const tenant = tenantResult.rows[0]
    
    // Create user
    const userResult = await db.query(
      `INSERT INTO users (id, email, password_hash, name, tenant_id, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, tenant_id, role, status, created_at`,
      [uuidv4(), body.email, passwordHash, body.name, tenant.id, 'admin', 'active']
    )
    
    const user = userResult.rows[0]
    
    // Generate tokens
    const token = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    
    // Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    )
    
    logger.info(`New user registered: ${user.email}`)
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenant_id,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
        },
        token,
        refreshToken,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    logger.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

/**
 * Login
 * POST /auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)
    
    // Find user
    const result = await db.query(
      `SELECT u.*, t.name as tenant_name, t.subdomain as tenant_subdomain
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = $1 AND u.status = 'active'`,
      [body.email]
    )
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const user = result.rows[0]
    
    // Verify password
    const validPassword = await bcrypt.compare(body.password, user.password_hash)
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    )
    
    // Generate tokens
    const token = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    
    // Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    )
    
    logger.info(`User logged in: ${user.email}`)
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenant_id,
          role: user.role,
        },
        tenant: {
          name: user.tenant_name,
          subdomain: user.tenant_subdomain,
        },
        token,
        refreshToken,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    logger.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

/**
 * Refresh token
 * POST /auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const body = refreshSchema.parse(req.body)
    
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT secret not configured')
    }
    
    // Verify refresh token
    const decoded = jwt.verify(body.refreshToken, secret) as any
    
    // Check if token exists in database
    const tokenResult = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [body.refreshToken]
    )
    
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
    
    // Get user
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1 AND status = $2',
      [decoded.id, 'active']
    )
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    const user = userResult.rows[0]
    
    // Generate new access token
    const token = generateAccessToken(user)
    
    res.json({
      success: true,
      data: { token },
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    logger.error('Token refresh error:', error)
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

/**
 * Logout
 * POST /auth/logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    
    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    }
    
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    logger.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Helper functions
function generateAccessToken(user: any): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      role: user.role,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function generateRefreshToken(user: any): string {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  
  return jwt.sign(
    { id: user.id },
    secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  )
}

export { router as authRouter }
