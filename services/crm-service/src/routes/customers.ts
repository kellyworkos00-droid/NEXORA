import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// Apply authentication to all routes
router.use(authenticate)

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['lead', 'prospect', 'active', 'churned']).default('lead'),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
})

const updateCustomerSchema = createCustomerSchema.partial()

/**
 * List customers
 * GET /customers?page=1&limit=20&status=active&search=john
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const tenantId = authReq.user!.tenantId
    
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as string
    const search = req.query.search as string
    const offset = (page - 1) * limit
    
    let query = 'SELECT * FROM customers WHERE tenant_id = $1'
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE tenant_id = $1'
    const params: any[] = [tenantId]
    let paramIndex = 2
    
    if (status) {
      query += ` AND status = $${paramIndex}`
      countQuery += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`
      countQuery += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    
    const [customers, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)),
    ])
    
    const total = parseInt(countResult.rows[0].count)
    
    res.json({
      success: true,
      data: {
        customers: customers.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
})

/**
 * Get customer by ID
 * GET /customers/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    
    const result = await db.query(
      'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
      [id, authReq.user!.tenantId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    res.json({
      success: true,
      data: { customer: result.rows[0] },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' })
  }
})

/**
 * Create customer
 * POST /customers
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const body = createCustomerSchema.parse(req.body)
    
    const result = await db.query(
      `INSERT INTO customers (id, tenant_id, name, email, phone, company, status, tags, custom_fields, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        uuidv4(),
        authReq.user!.tenantId,
        body.name,
        body.email,
        body.phone,
        body.company,
        body.status,
        body.tags,
        JSON.stringify(body.customFields),
        authReq.user!.id,
      ]
    )
    
    res.status(201).json({
      success: true,
      data: { customer: result.rows[0] },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    res.status(500).json({ error: 'Failed to create customer' })
  }
})

/**
 * Update customer
 * PATCH /customers/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    const body = updateCustomerSchema.parse(req.body)
    
    const updates: string[] = []
    const values: any[] = []
    let valueIndex = 1
    
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        if (key === 'customFields') {
          updates.push(`custom_fields = $${valueIndex}`)
          values.push(JSON.stringify(value))
        } else if (key === 'tags') {
          updates.push(`tags = $${valueIndex}`)
          values.push(value)
        } else {
          updates.push(`${dbKey} = $${valueIndex}`)
          values.push(value)
        }
        valueIndex++
      }
    })
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }
    
    updates.push(`updated_at = NOW()`)
    values.push(id, authReq.user!.tenantId)
    
    const result = await db.query(
      `UPDATE customers SET ${updates.join(', ')}
       WHERE id = $${valueIndex} AND tenant_id = $${valueIndex + 1}
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    res.json({
      success: true,
      data: { customer: result.rows[0] },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    res.status(500).json({ error: 'Failed to update customer' })
  }
})

/**
 * Delete customer
 * DELETE /customers/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest
    const { id } = req.params
    
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, authReq.user!.tenantId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' })
  }
})

export { router as customersRouter }
