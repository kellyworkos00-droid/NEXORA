import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { predictionsRouter } from './routes/predictions'
import { insightsRouter } from './routes/insights'
import { automationRouter } from './routes/automation'
import { chatRouter } from './routes/chat'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4002

app.use(express.json())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'ai-engine', timestamp: new Date().toISOString() })
})

// Routes
app.use('/predictions', predictionsRouter)
app.use('/insights', insightsRouter)
app.use('/automation', automationRouter)
app.use('/chat', chatRouter)

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('AI Engine error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  logger.info(`🤖 AI Engine running on port ${PORT}`)
})

export default app
