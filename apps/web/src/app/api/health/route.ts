import { NextResponse } from 'next/server'
import { getPool } from '@/app/api/data/db'

export async function GET() {
  const startTime = Date.now()
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {},
  }

  // Check database connection
  try {
    const pool = getPool()
    const result = await pool.query('SELECT 1 as alive')
    health.services.database = {
      status: 'connected',
      latency: `${Date.now() - startTime}ms`,
    }
  } catch (error: any) {
    health.status = 'degraded'
    health.services.database = {
      status: 'error',
      error: error.message,
    }
  }

  // Check API response time
  const responseTime = Date.now() - startTime
  health.responseTime = `${responseTime}ms`

  // Memory usage
  const memoryUsage = process.memoryUsage()
  health.memory = {
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
