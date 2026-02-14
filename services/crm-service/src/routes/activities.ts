import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const createActivitySchema = z.object({
  customerId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  type: z.enum(['call', 'email', 'meeting', 'task', 'note']),
  subject: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
})

/**
 * List activities
 * GET /activities?customerId=xxx&dealId=xxx
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const tenantId = authReq.user!.tenantId
    const { customerId, dealId } = req.query
    
    let query = `
      SELECT a.*, c.name as customer_name, d.title as deal_title, u.name as assigned_to_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE a.tenant_id = $1
    `
    const params: any[] = [tenantId]
    
    if (customerId) {
      query += ` AND a.customer_id = $2`
      params.push(customerId)
    }
    if (dealId) {
      query += ` AND a.deal_id = $${params.length + 1}`
      params.push(dealId)
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT 100`
    
    const result = await db.query(query, params)
    
    res.json({
      success: true,
      data: { activities: result.rows },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

/**
 * Create activity
 * POST /activities
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const body = createActivitySchema.parse(req.body)
    
    const result = await db.query(
      `INSERT INTO activities (id, tenant_id, customer_id, deal_id, type, subject, description, due_date, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        uuidv4(),
        authReq.user!.tenantId,
        body.customerId,
        body.dealId,
        body.type,
        body.subject,
        body.description,
        body.dueDate,
        body.assignedTo,
        authReq.user!.id,
      ]
    )
    
    res.status(201).json({
      success: true,
      data: { activity: result.rows[0] },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

/**
 * Mark activity as completed
 * PATCH /activities/:id/complete
 */
router.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    
    const result = await db.query(
      `UPDATE activities 
       SET completed = true, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [id, authReq.user!.tenantId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' })
    }
    
    res.json({
      success: true,
      data: { activity: result.rows[0] },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete activity' })
  }
})

export { router as activitiesRouter }
