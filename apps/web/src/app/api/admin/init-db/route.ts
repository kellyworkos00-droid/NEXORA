import { NextResponse } from 'next/server'
import { initDatabase } from '@/app/api/data/db'

export async function POST() {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database initialization is not allowed in production' },
        { status: 403 }
      )
    }

    await initDatabase()

    return NextResponse.json(
      {
        success: true,
        message: 'Database schema initialized successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
