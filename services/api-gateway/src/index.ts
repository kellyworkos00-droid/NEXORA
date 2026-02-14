import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { authenticate } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// API Gateway Routes with Proxying

// Auth Service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
    onError: (err, req, res) => {
      logger.error('Auth service proxy error:', err)
      res.status(503).json({ error: 'Auth service unavailable' })
    },
  })
)

// CRM Service
app.use(
  '/api/crm',
  authenticate,
  createProxyMiddleware({
    target: process.env.CRM_SERVICE_URL || 'http://localhost:4003',
    changeOrigin: true,
    pathRewrite: { '^/api/crm': '' },
    onError: (err, req, res) => {
      logger.error('CRM service proxy error:', err)
      res.status(503).json({ error: 'CRM service unavailable' })
    },
  })
)

// ERP Service
app.use(
  '/api/erp',
  authenticate,
  createProxyMiddleware({
    target: process.env.ERP_SERVICE_URL || 'http://localhost:4004',
    changeOrigin: true,
    pathRewrite: { '^/api/erp': '' },
    onError: (err, req, res) => {
      logger.error('ERP service proxy error:', err)
      res.status(503).json({ error: 'ERP service unavailable' })
    },
  })
)

// AI Engine
app.use(
  '/api/ai',
  authenticate,
  createProxyMiddleware({
    target: process.env.AI_ENGINE_URL || 'http://localhost:4002',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '' },
    onError: (err, req, res) => {
      logger.error('AI engine proxy error:', err)
      res.status(503).json({ error: 'AI service unavailable' })
    },
  })
)

// Analytics Service
app.use(
  '/api/analytics',
  authenticate,
  createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4005',
    changeOrigin: true,
    pathRewrite: { '^/api/analytics': '' },
    onError: (err, req, res) => {
      logger.error('Analytics service proxy error:', err)
      res.status(503).json({ error: 'Analytics service unavailable' })
    },
  })
)

// Marketplace
app.use(
  '/api/marketplace',
  authenticate,
  createProxyMiddleware({
    target: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:4006',
    changeOrigin: true,
    pathRewrite: { '^/api/marketplace': '' },
    onError: (err, req, res) => {
      logger.error('Marketplace service proxy error:', err)
      res.status(503).json({ error: 'Marketplace service unavailable' })
    },
  })
)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
