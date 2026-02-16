import { Pool, PoolClient } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    pool = new Pool({
      connectionString,
      ssl: connectionString?.includes('sslmode=require') 
        ? { rejectUnauthorized: false }
        : undefined,
    })

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }
  return pool
}

export async function query(sql: string, params?: any[]) {
  const client = await getPool().connect()
  try {
    const result = await client.query(sql, params)
    return result
  } finally {
    client.release()
  }
}

export async function initDatabase() {
  try {
    // Create users table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        avatar_url VARCHAR(500),
        bio TEXT,
        role VARCHAR(50) DEFAULT 'user',
        email_verified BOOLEAN DEFAULT FALSE,
        two_factor_secret VARCHAR(255),
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `)

    // Create sessions table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token VARCHAR(500),
        device_name VARCHAR(255),
        device_type VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent TEXT,
        location VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `)

    // Create email verification tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
    `)

    // Create password reset tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
    `)

    // Create user preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'UTC',
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    `)

    // Create activity logs table
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
    `)

    // Create notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `)

    // Create whiteboards tables
    await query(`
      CREATE TABLE IF NOT EXISTS whiteboards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_whiteboards_created_by ON whiteboards(created_by);
      CREATE INDEX IF NOT EXISTS idx_whiteboards_created_at ON whiteboards(created_at DESC);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS whiteboard_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        board_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_whiteboard_members_unique ON whiteboard_members(board_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_whiteboard_members_user_id ON whiteboard_members(user_id);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS whiteboard_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        board_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        x INTEGER NOT NULL DEFAULT 0,
        y INTEGER NOT NULL DEFAULT 0,
        width INTEGER NOT NULL DEFAULT 240,
        height INTEGER NOT NULL DEFAULT 160,
        content TEXT,
        color VARCHAR(50) DEFAULT 'sunrise',
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_whiteboard_items_board_id ON whiteboard_items(board_id);
      CREATE INDEX IF NOT EXISTS idx_whiteboard_items_created_at ON whiteboard_items(created_at DESC);
    `)

    // Create chat tables
    await query(`
      CREATE TABLE IF NOT EXISTS chat_channels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(120) NOT NULL,
        description TEXT,
        is_private BOOLEAN DEFAULT FALSE,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chat_channels_created_by ON chat_channels(created_by);
      CREATE INDEX IF NOT EXISTS idx_chat_channels_created_at ON chat_channels(created_at DESC);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS chat_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_members_unique ON chat_members(channel_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        thread_parent_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
        reply_count INTEGER DEFAULT 0,
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_parent_id ON chat_messages(thread_parent_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS chat_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        emoji VARCHAR(40) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_reactions_unique ON chat_reactions(message_id, user_id, emoji);
      CREATE INDEX IF NOT EXISTS idx_chat_reactions_message_id ON chat_reactions(message_id);
    `)

    // Create tasks tables
    await query(`
      CREATE TABLE IF NOT EXISTS task_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(50) DEFAULT 'sunrise',
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_task_lists_created_by ON task_lists(created_by);
      CREATE INDEX IF NOT EXISTS idx_task_lists_created_at ON task_lists(created_at DESC);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'medium',
        due_at TIMESTAMP,
        order_index INTEGER DEFAULT 0,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_task_assignees_unique ON task_assignees(task_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS task_sprints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        goal TEXT,
        start_at TIMESTAMP,
        end_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'planned',
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_task_sprints_list_id ON task_sprints(list_id);
      CREATE INDEX IF NOT EXISTS idx_task_sprints_status ON task_sprints(status);
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS task_sprint_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sprint_id UUID NOT NULL REFERENCES task_sprints(id) ON DELETE CASCADE,
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_task_sprint_items_unique ON task_sprint_items(sprint_id, task_id);
      CREATE INDEX IF NOT EXISTS idx_task_sprint_items_sprint_id ON task_sprint_items(sprint_id);
    `)

    console.log('✅ Database tables initialized')
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message)
  }
}
