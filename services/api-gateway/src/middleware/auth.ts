import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    tenantId: string
    role: string
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET

    if (!secret) {
      logger.error('JWT_SECRET not configured')
      return res.status(500).json({ error: 'Authentication not configured' })
    }

    const decoded = jwt.verify(token, secret) as {
      id: string
      email: string
      tenantId: string
      role: string
    }

    ;(req as AuthRequest).user = decoded
    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}
