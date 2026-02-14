import { Router, Request, Response } from 'express'
import { db } from '../db/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * Get current user profile
 * GET /users/me
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    
    const result = await db.query(
      `SELECT u.id, u.email, u.name, u.avatar, u.tenant_id, u.role, u.status, 
              u.created_at, t.name as tenant_name, t.subdomain as tenant_subdomain
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [authReq.user!.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const user = result.rows[0]
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          createdAt: user.created_at,
        },
        tenant: {
          id: user.tenant_id,
          name: user.tenant_name,
          subdomain: user.tenant_subdomain,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

/**
 * Update user profile
 * PATCH /users/me
 */
router.patch('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { name, avatar } = req.body
    
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           avatar = COALESCE($2, avatar),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, avatar, role, status`,
      [name, avatar, authReq.user!.id]
    )
    
    res.json({
      success: true,
      data: { user: result.rows[0] },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export { router as userRouter }
