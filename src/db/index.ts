import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
});

// Simple database wrapper
export const db = {
  async execute(sql: string, params: any[] = []) {
    // Convert undefined to null for database compatibility
    const safeParams = params.map(param => param === undefined ? null : param);
    return await client.execute(sql, safeParams);
  },
  
  async select(sql: string, params: any[] = []) {
    const safeParams = params.map(param => param === undefined ? null : param);
    const result = await client.execute(sql, safeParams);
    return result.rows;
  },
  
  async insert(sql: string, params: any[] = []) {
    const safeParams = params.map(param => param === undefined ? null : param);
    const result = await client.execute(sql, safeParams);
    return result;
  },
  
  async update(sql: string, params: any[] = []) {
    const safeParams = params.map(param => param === undefined ? null : param);
    const result = await client.execute(sql, safeParams);
    return result;
  },
  
  async delete(sql: string, params: any[] = []) {
    const safeParams = params.map(param => param === undefined ? null : param);
    const result = await client.execute(sql, safeParams);
    return result;
  }
};

let isDatabaseInitialized = false;

export async function initializeDatabase() {
  if (isDatabaseInitialized) return;
  
  try {
    console.log('🔄 Initializing database...');
    
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        expires_at INTEGER NOT NULL,
        fresh INTEGER DEFAULT 1,
        user_agent TEXT,
        ip_address TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        location TEXT,
        timezone TEXT DEFAULT 'UTC',
        weather_unit TEXT DEFAULT 'celsius',
        calendar_connected INTEGER DEFAULT 0,
        calendar_provider TEXT,
        goals TEXT,
        progress TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Database initialized successfully');
    isDatabaseInitialized = true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Session management functions
export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const sessionId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days in seconds
  
  await db.execute(
    'INSERT INTO sessions (id, user_id, expires_at, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)',
    [sessionId, userId, expiresAt, userAgent || null, ipAddress || null]
  );

  return sessionId;
}

export async function validateSession(sessionId: string) {
  const sessions = await db.select(
    `SELECT s.*, u.id as user_id, u.email, u.name 
     FROM sessions s 
     LEFT JOIN users u ON s.user_id = u.id 
     WHERE s.id = ? AND s.expires_at > ? 
     LIMIT 1`,
    [sessionId, Math.floor(Date.now() / 1000)]
  );

  if (sessions.length === 0) return null;

  const session = sessions[0];
  return {
    id: session.id,
    userId: session.user_id,
    expiresAt: new Date(session.expires_at * 1000),
    fresh: Boolean(session.fresh),
    user: session.user_id ? {
      id: session.user_id,
      email: session.email,
      name: session.name
    } : null
  };
}

export async function deleteSession(sessionId: string) {
  await db.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
}

export async function getUserByEmail(email: string) {
  const users = await db.select(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return users[0] || null;
}

export async function createUser(id: string, email: string, name: string) {
  await db.execute(
    'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
    [id, email, name || email.split('@')[0]]
  );
  return { id, email, name: name || email.split('@')[0] };
}

export async function getUserPreferences(userId: string) {
  const prefs = await db.select(
    'SELECT * FROM user_preferences WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return prefs[0] || null;
}

export async function updateUserPreferences(userId: string, updates: any) {
  const existing = await getUserPreferences(userId);
  const now = Math.floor(Date.now() / 1000);
  
  // Convert undefined values to null
  const safeUpdates = {
    location: updates.location || null,
    timezone: updates.timezone || 'UTC',
    weatherUnit: updates.weatherUnit || 'celsius',
    calendarConnected: updates.calendarConnected ? 1 : 0,
    calendarProvider: updates.calendarProvider || null,
    goals: updates.goals || null,
    progress: updates.progress || null
  };
  
  if (existing) {
    await db.execute(
      `UPDATE user_preferences 
       SET location = ?, timezone = ?, weather_unit = ?, calendar_connected = ?, 
           calendar_provider = ?, goals = ?, progress = ?, updated_at = ?
       WHERE user_id = ?`,
      [
        safeUpdates.location,
        safeUpdates.timezone,
        safeUpdates.weatherUnit,
        safeUpdates.calendarConnected,
        safeUpdates.calendarProvider,
        safeUpdates.goals,
        safeUpdates.progress,
        now,
        userId
      ]
    );
  } else {
    await db.execute(
      `INSERT INTO user_preferences 
       (user_id, location, timezone, weather_unit, calendar_connected, calendar_provider, goals, progress) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        safeUpdates.location,
        safeUpdates.timezone,
        safeUpdates.weatherUnit,
        safeUpdates.calendarConnected,
        safeUpdates.calendarProvider,
        safeUpdates.goals,
        safeUpdates.progress
      ]
    );
  }
}