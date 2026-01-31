import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Allowed extensions mapped from MIME types - prevents path traversal via malicious extensions
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

// Magic bytes for file type validation
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType]
  if (!expected) return false

  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false
  }
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert to buffer for magic byte validation
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate magic bytes to prevent MIME type spoofing
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File content does not match declared type' },
        { status: 400 }
      )
    }

    // Generate unique filename with safe extension derived from MIME type
    // This prevents path traversal attacks via malicious extensions like "../../../etc/passwd"
    const timestamp = Date.now()
    const safeExtension = MIME_TO_EXTENSION[file.type]
    const filename = `${user.id}-${timestamp}.${safeExtension}`

    // Save file to public/uploads/receipts
    const filepath = join(process.cwd(), 'public', 'uploads', 'receipts', filename)
    await writeFile(filepath, buffer)

    // Return URL
    const url = `/uploads/receipts/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
