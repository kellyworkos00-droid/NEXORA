import { Router, Request, Response } from 'express'
import { AIService } from '../services/ai-service'

const router = Router()
const aiService = new AIService()

/**
 * Generate Business Insights
 * POST /insights/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { tenantId, dataType, timeRange } = req.body
    
    const insights = await aiService.generateInsights({
      tenantId,
      dataType,
      timeRange,
    })
    
    res.json(insights)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights' })
  }
})

/**
 * Anomaly Detection
 * POST /insights/anomalies
 */
router.post('/anomalies', async (req: Request, res: Response) => {
  try {
    const { tenantId, metrics } = req.body
    
    const anomalies = await aiService.detectAnomalies({
      tenantId,
      metrics,
    })
    
    res.json(anomalies)
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect anomalies' })
  }
})

/**
 * Auto-generate Reports
 * POST /insights/reports
 */
router.post('/reports', async (req: Request, res: Response) => {
  try {
    const { tenantId, reportType, parameters } = req.body
    
    const report = await aiService.generateReport({
      tenantId,
      reportType,
      parameters,
    })
    
    res.json(report)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

export { router as insightsRouter }
