import crypto from 'crypto'

export interface User {
  id: string
  email: string
  name: string
  password: string // In production, this would be hashed
  createdAt: string
}

// Mock users for demo purposes
const usersData: User[] = [
  {
    id: '1',
    email: 'demo@nexora.ai',
    name: 'Demo User',
    password: 'password123', // In production: bcrypt hashed
    createdAt: '2025-01-01',
  },
]

export function findUserByEmail(email: string): User | undefined {
  return usersData.find(u => u.email === email)
}

export function findUserById(id: string): User | undefined {
  return usersData.find(u => u.id === id)
}

export function createUser(email: string, name: string, password: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    password, // In production: hash this with bcrypt
    createdAt: new Date().toISOString(),
  }
  usersData.push(user)
  return user
}

export function validatePassword(plainPassword: string, storedPassword: string): boolean {
  // In production, use bcrypt.compare()
  return plainPassword === storedPassword
}

export function generateToken(userId: string): string {
  // In production, use JWT signing
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })
  ).toString('base64')
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'secret-key')
    .update(`${header}.${payload}`)
    .digest('base64')
  return `${header}.${payload}.${signature}`
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const [header, payload, signature] = token.split('.')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'secret-key')
      .update(`${header}.${payload}`)
      .digest('base64')

    if (signature !== expectedSignature) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    return { userId: decoded.userId }
  } catch {
    return null
  }
}
