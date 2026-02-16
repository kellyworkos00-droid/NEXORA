import { NextResponse } from 'next/server'
import { query } from '@/app/api/data/db'

export async function GET() {
  try {
    // Check if users table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    // Get column info for users table if it exists
    const usersColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `)
    
    return NextResponse.json({
      tables: tableCheck.rows,
      usersColumns: usersColumns.rows,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
