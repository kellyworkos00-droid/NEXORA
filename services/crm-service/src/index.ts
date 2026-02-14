import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { customersRouter } from './routes/customers'
import { dealsRouter } from './routes/deals'
import { activitiesRouter } from './routes/activities'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4003

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'crm-service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/customers', customersRouter)
app.use('/deals', dealsRouter)
app.use('/activities', activitiesRouter)

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('CRM Service error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  logger.info(`👥 CRM Service running on port ${PORT}`)
})

export default app
