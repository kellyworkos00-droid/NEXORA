import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/app/api/data/auth-store'
import { getPool } from '@/app/api/data/db'

const pool = getPool()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const cookieStore = cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const boardId = params.id
    const { name, description, config } = await request.json()

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Name and config are required' },
        { status: 400 }
      )
    }

    // Verify board ownership
    const boardRes = await pool.query(
      'SELECT id, created_by FROM whiteboards WHERE id = $1',
      [boardId]
    )

    const board = boardRes.rows[0]
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    if (board.created_by !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to save template' },
        { status: 403 }
      )
    }

    // Save template
    const result = await pool.query(
      `INSERT INTO whiteboard_templates (board_id, name, description, config, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, config, created_at`,
      [boardId, name, description, JSON.stringify(config), decoded.userId]
    )

    const template = result.rows[0]

    return NextResponse.json({ template }, { status: 201 })
  } catch (error: any) {
    console.error('Template save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save template' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const cookieStore = cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const boardId = params.id

    // Verify board ownership
    const boardRes = await pool.query(
      'SELECT id, created_by FROM whiteboards WHERE id = $1',
      [boardId]
    )

    const board = boardRes.rows[0]
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    if (board.created_by !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to view templates' },
        { status: 403 }
      )
    }

    // Get templates
    const result = await pool.query(
      `SELECT id, name, description, config, created_at 
       FROM whiteboard_templates 
       WHERE board_id = $1 
       ORDER BY created_at DESC`,
      [boardId]
    )

    const templates = result.rows.map((t: any) => ({
      ...t,
      config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config
    }))

    return NextResponse.json({ templates }, { status: 200 })
  } catch (error: any) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get templates' },
      { status: 500 }
    )
  }
}
