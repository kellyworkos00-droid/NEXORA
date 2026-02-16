import { NextResponse } from 'next/server'
import { query } from '@/app/api/data/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')
    
    const result = await query('SELECT NOW() as current_time, version() as pg_version')
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Database connection successful',
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      code: error.code,
    }, { status: 500 })
  }
}
