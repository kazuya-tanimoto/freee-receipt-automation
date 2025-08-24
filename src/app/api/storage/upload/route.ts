import { GoogleDriveStorage } from '@/lib/drive-storage'
import { type NextRequest, NextResponse } from 'next/server'

interface UploadRequest {
  file: string // Base64 encoded file content
  originalName: string
  date: string // ISO date string
}

/**
 * POST /api/storage/upload
 * Upload receipt file to Google Drive with monthly organization
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    const baseFolderId = process.env.DRIVE_FOLDER_ID

    if (!apiKey || !baseFolderId) {
      return NextResponse.json({ error: 'Google Drive configuration missing' }, { status: 500 })
    }

    // Parse request body
    const body: UploadRequest = await request.json()

    // Validate required fields
    if (!body.file || !body.originalName || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: file, originalName, date' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(body.file, 'base64')
    const receiptDate = new Date(body.date)

    // Validate date
    if (Number.isNaN(receiptDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    // Initialize Google Drive storage
    const driveStorage = new GoogleDriveStorage(apiKey, baseFolderId)

    // Save receipt to Google Drive
    const driveFileInfo = await driveStorage.saveReceipt(fileBuffer, body.originalName, receiptDate)

    return NextResponse.json({
      success: true,
      file: driveFileInfo,
    })
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error)

    return NextResponse.json(
      {
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
