import { Router, Request, Response } from 'express'
import { AIService } from '../services/ai-service'

const router = Router()
const aiService = new AIService()

/**
 * Revenue Predictions
 * POST /predictions/revenue
 */
router.post('/revenue', async (req: Request, res: Response) => {
  try {
    const { tenantId, dateRange, historicalData } = req.body
    
    const prediction = await aiService.predictRevenue({
      tenantId,
      dateRange,
      historicalData,
    })
    
    res.json(prediction)
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict revenue' })
  }
})

/**
 * Churn Risk Detection
 * POST /predictions/churn
 */
router.post('/churn', async (req: Request, res: Response) => {
  try {
    const { tenantId, customerId, customerData } = req.body
    
    const churnRisk = await aiService.predictChurnRisk({
      tenantId,
      customerId,
      customerData,
    })
    
    res.json(churnRisk)
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict churn risk' })
  }
})

/**
 * Stock Predictions
 * POST /predictions/inventory
 */
router.post('/inventory', async (req: Request, res: Response) => {
  try {
    const { tenantId, productId, historicalData } = req.body
    
    const prediction = await aiService.predictInventory({
      tenantId,
      productId,
      historicalData,
    })
    
    res.json(prediction)
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict inventory' })
  }
})

/**
 * Pricing Optimization
 * POST /predictions/pricing
 */
router.post('/pricing', async (req: Request, res: Response) => {
  try {
    const { tenantId, productId, marketData, competitorPricing } = req.body
    
    const pricing = await aiService.optimizePricing({
      tenantId,
      productId,
      marketData,
      competitorPricing,
    })
    
    res.json(pricing)
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize pricing' })
  }
})

/**
 * Hiring Recommendations
 * POST /predictions/hiring
 */
router.post('/hiring', async (req: Request, res: Response) => {
  try {
    const { tenantId, departmentData, growthMetrics } = req.body
    
    const recommendations = await aiService.recommendHiring({
      tenantId,
      departmentData,
      growthMetrics,
    })
    
    res.json(recommendations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate hiring recommendations' })
  }
})

export { router as predictionsRouter }
