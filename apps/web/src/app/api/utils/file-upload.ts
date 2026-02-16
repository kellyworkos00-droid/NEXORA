import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'

export interface FileUploadResult {
  success: boolean
  url?: string
  filename?: string
  size?: number
  error?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export const UPLOAD_PATHS = {
  AVATARS: 'public/uploads/avatars',
  DOCUMENTS: 'public/uploads/documents',
  TEMP: 'public/uploads/temp',
}

// Ensure upload directories exist
export async function ensureUploadDirectories() {
  for (const path of Object.values(UPLOAD_PATHS)) {
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true })
    }
  }
}

function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop()
  const hash = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${hash}.${ext}`
}

function getMimeType(buffer: Buffer): string | null {
  // Check magic numbers for file types
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif'
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    return 'image/webp'
  }
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf'
  }
  return null
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<FileUploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit',
      }
    }

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file type by magic number (more secure than MIME type)
    const actualMimeType = getMimeType(buffer)
    if (!actualMimeType || !ALLOWED_IMAGE_TYPES.includes(actualMimeType)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filepath = join(process.cwd(), UPLOAD_PATHS.AVATARS, filename)

    // Ensure directory exists
    await ensureUploadDirectories()

    // Write file
    await writeFile(filepath, buffer)

    return {
      success: true,
      url: `/uploads/avatars/${filename}`,
      filename,
      size: file.size,
    }
  } catch (error) {
    console.error('Avatar upload failed:', error)
    return {
      success: false,
      error: 'Failed to upload avatar',
    }
  }
}

export async function uploadDocument(
  file: File,
  userId: string,
  allowedTypes: string[] = ALLOWED_DOCUMENT_TYPES
): Promise<FileUploadResult> {
  try {
    // Validate file size (10MB for documents)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 10MB limit',
      }
    }

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file type
    const actualMimeType = getMimeType(buffer)
    if (!actualMimeType || !allowedTypes.includes(actualMimeType)) {
      return {
        success: false,
        error: 'Invalid file type',
      }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filepath = join(process.cwd(), UPLOAD_PATHS.DOCUMENTS, filename)

    // Ensure directory exists
    await ensureUploadDirectories()

    // Write file
    await writeFile(filepath, buffer)

    return {
      success: true,
      url: `/uploads/documents/${filename}`,
      filename,
      size: file.size,
    }
  } catch (error) {
    console.error('Document upload failed:', error)
    return {
      success: false,
      error: 'Failed to upload document',
    }
  }
}

export function validateImageDimensions(
  buffer: Buffer,
  maxWidth: number = 2000,
  maxHeight: number = 2000
): boolean {
  // This is a placeholder - in production, use a library like 'sharp' or 'jimp'
  // to validate actual image dimensions
  return true
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

export async function deleteFile(filepath: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises')
    const fullPath = join(process.cwd(), 'public', filepath)
    await fs.unlink(fullPath)
    return true
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
}
