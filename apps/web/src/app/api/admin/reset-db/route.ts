import { NextResponse } from 'next/server'
import { query } from '@/app/api/data/db'
import { initDatabase } from '@/app/api/data/db'

export async function POST() {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This operation is not allowed in production' },
        { status: 403 }
      )
    }

    console.log('Dropping all existing tables...')
    
    // Drop all tables in the correct order (respecting foreign keys)
    const dropStatements = [
      'DROP TABLE IF EXISTS task_sprint_items CASCADE',
      'DROP TABLE IF EXISTS task_sprints CASCADE',
      'DROP TABLE IF EXISTS task_assignees CASCADE',
      'DROP TABLE IF EXISTS task_comments CASCADE',
      'DROP TABLE IF EXISTS tasks CASCADE',
      'DROP TABLE IF EXISTS task_lists CASCADE',
      'DROP TABLE IF EXISTS chat_message_reactions CASCADE',
      'DROP TABLE IF EXISTS chat_messages CASCADE',
      'DROP TABLE IF EXISTS chat_members CASCADE',
      'DROP TABLE IF EXISTS chat_channels CASCADE',
      'DROP TABLE IF EXISTS whiteboard_items CASCADE',
      'DROP TABLE IF EXISTS whiteboard_members CASCADE',
      'DROP TABLE IF EXISTS whiteboards CASCADE',
      'DROP TABLE IF EXISTS notifications CASCADE',
      'DROP TABLE IF EXISTS user_activity_logs CASCADE',
      'DROP TABLE IF EXISTS user_preferences CASCADE',
      'DROP TABLE IF EXISTS password_reset_tokens CASCADE',
      'DROP TABLE IF EXISTS email_verification_tokens CASCADE',
      'DROP TABLE IF EXISTS sessions CASCADE',
      'DROP TABLE IF EXISTS refresh_tokens CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS tenants CASCADE',
      'DROP TABLE IF EXISTS activities CASCADE',
      'DROP TABLE IF EXISTS deals CASCADE',
      'DROP TABLE IF EXISTS customers CASCADE',
    ]

    for (const statement of dropStatements) {
      await query(statement)
    }

    console.log('All tables dropped successfully')
    console.log('Initializing database with new schema...')

    // Initialize database with new schema
    await initDatabase()

    console.log('Database reset completed successfully')

    return NextResponse.json(
      {
        success: true,
        message: 'Database has been reset and initialized with new schema',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Database reset error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset database',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
