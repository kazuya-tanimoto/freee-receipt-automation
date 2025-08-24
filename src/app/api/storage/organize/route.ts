import { GoogleDriveStorage } from '@/lib/drive-storage'
import { google } from 'googleapis'
import { type NextRequest, NextResponse } from 'next/server'

interface OrganizeRequest {
  fileIds: string[]
}

interface FileMetadata {
  id: string
  name: string
  modifiedTime: string
}

/**
 * POST /api/storage/organize
 * Manually organize files by moving them to appropriate monthly folders
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
    const body: OrganizeRequest = await request.json()

    // Validate required fields
    if (!body.fileIds || !Array.isArray(body.fileIds) || body.fileIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid fileIds array' }, { status: 400 })
    }

    // Initialize Google Drive API and storage
    const drive = google.drive({
      version: 'v3',
      auth: apiKey,
    })
    const driveStorage = new GoogleDriveStorage(apiKey, baseFolderId)

    let organizedCount = 0
    const results = []

    // Process each file
    for (const fileId of body.fileIds) {
      try {
        // Get file metadata
        const fileResponse = await drive.files.get({
          fileId,
          fields: 'id,name,modifiedTime,parents',
        })

        const file = fileResponse.data as FileMetadata & { parents?: string[] }

        if (!file.name || !file.modifiedTime) {
          results.push({
            fileId,
            success: false,
            error: 'Missing file metadata',
          })
          continue
        }

        // Use modified time as organization date
        const organizationDate = new Date(file.modifiedTime)

        if (Number.isNaN(organizationDate.getTime())) {
          results.push({
            fileId,
            success: false,
            error: 'Invalid modification time',
          })
          continue
        }

        // Create monthly folder if not exists
        const monthlyFolderId = await driveStorage.createMonthlyFolder(organizationDate)

        // Check if file is already in the correct folder
        const currentParents = file.parents || []
        if (currentParents.includes(monthlyFolderId)) {
          results.push({
            fileId,
            success: true,
            message: 'File already in correct folder',
            folderId: monthlyFolderId,
          })
          continue
        }

        // Move file to monthly folder
        await drive.files.update({
          fileId,
          addParents: monthlyFolderId,
          removeParents: currentParents.join(','),
          fields: 'id,parents',
        })

        organizedCount++
        results.push({
          fileId,
          success: true,
          message: 'File moved successfully',
          folderId: monthlyFolderId,
        })
      } catch (fileError) {
        console.error(`Error organizing file ${fileId}:`, fileError)
        results.push({
          fileId,
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      organizedCount,
      totalFiles: body.fileIds.length,
      results,
    })
  } catch (error) {
    console.error('Error organizing files:', error)

    return NextResponse.json(
      {
        error: 'Failed to organize files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
