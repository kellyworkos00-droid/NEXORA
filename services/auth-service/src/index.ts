import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { authRouter } from './routes/auth'
import { userRouter } from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'auth-service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/auth', authRouter)
app.use('/users', userRouter)

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Auth Service error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  logger.info(`🔐 Auth Service running on port ${PORT}`)
})

export default app
