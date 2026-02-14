import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

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
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
