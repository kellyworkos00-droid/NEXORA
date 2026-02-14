import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const createDealSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(1),
  value: z.number().positive(),
  stage: z.enum(['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('qualification'),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
})

const updateDealSchema = createDealSchema.partial()

/**
 * List deals
 * GET /deals?page=1&limit=20&stage=proposal
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const tenantId = authReq.user!.tenantId
    
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const stage = req.query.stage as string
    const offset = (page - 1) * limit
    
    let query = `
      SELECT d.*, c.name as customer_name, c.email as customer_email,
             u.name as assigned_to_name
      FROM deals d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN users u ON d.assigned_to = u.id
      WHERE d.tenant_id = $1
    `
    const params: any[] = [tenantId]
    
    if (stage) {
      query += ` AND d.stage = $2`
      params.push(stage)
    }
    
    query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)
    
    const result = await db.query(query, params)
    
    res.json({
      success: true,
      data: { deals: result.rows },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' })
  }
})

/**
 * Create deal
 * POST /deals
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const body = createDealSchema.parse(req.body)
    
    const result = await db.query(
      `INSERT INTO deals (id, tenant_id, customer_id, title, value, stage, probability, expected_close_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        uuidv4(),
        authReq.user!.tenantId,
        body.customerId,
        body.title,
        body.value,
        body.stage,
        body.probability,
        body.expectedCloseDate,
        body.assignedTo,
      ]
    )
    
    res.status(201).json({
      success: true,
      data: { deal: result.rows[0] },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    res.status(500).json({ error: 'Failed to create deal' })
  }
})

/**
 * Update deal stage
 * PATCH /deals/:id/stage
 */
router.patch('/:id/stage', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const { stage, probability } = req.body
    
    const result = await db.query(
      `UPDATE deals 
       SET stage = $1, probability = COALESCE($2, probability), updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [stage, probability, id, authReq.user!.tenantId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' })
    }
    
    res.json({
      success: true,
      data: { deal: result.rows[0] },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deal' })
  }
})

/**
 * Update deal
 * PATCH /deals/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const body = updateDealSchema.parse(req.body)
    
    const updates: string[] = []
    const values: any[] = []
    let valueIndex = 1
    
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        updates.push(`${dbKey} = $${valueIndex}`)
        values.push(value)
        valueIndex++
      }
    })
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }
    
    updates.push(`updated_at = NOW()`)
    values.push(id, authReq.user!.tenantId)
    
    const result = await db.query(
      `UPDATE deals SET ${updates.join(', ')}
       WHERE id = $${valueIndex} AND tenant_id = $${valueIndex + 1}
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' })
    }
    
    res.json({
      success: true,
      data: { deal: result.rows[0] },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    res.status(500).json({ error: 'Failed to update deal' })
  }
})

/**
 * Delete deal
 * DELETE /deals/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    
    const result = await db.query(
      'DELETE FROM deals WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, authReq.user!.tenantId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deal' })
  }
})

export { router as dealsRouter }
