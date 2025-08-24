import type { FolderStructure } from '@/lib/drive-storage'
import { google } from 'googleapis'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/storage/folders
 * Get folder structure list from Google Drive
 * Query parameters: year (optional), month (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    const baseFolderId = process.env.DRIVE_FOLDER_ID

    if (!apiKey || !baseFolderId) {
      return NextResponse.json({ error: 'Google Drive configuration missing' }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    // Initialize Google Drive API
    const drive = google.drive({
      version: 'v3',
      auth: apiKey,
    })

    const folders: FolderStructure[] = []

    if (yearParam && monthParam) {
      // Get specific month folder
      const year = Number.parseInt(yearParam)
      const month = Number.parseInt(monthParam)

      if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: 'Invalid year or month parameter' }, { status: 400 })
      }

      const monthStr = String(month).padStart(2, '0')
      const folderPath = `${year}/${monthStr}`

      folders.push({
        baseFolder: baseFolderId,
        year,
        month,
        path: folderPath,
      })
    } else if (yearParam) {
      // Get all months for specific year
      const year = Number.parseInt(yearParam)

      if (Number.isNaN(year)) {
        return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 })
      }

      // Find year folder
      const yearFolders = await drive.files.list({
        q: `name='${year}' and '${baseFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
      })

      if (yearFolders.data.files && yearFolders.data.files.length > 0) {
        const yearFolderId = yearFolders.data.files[0].id

        // Get month folders
        const monthFolders = await drive.files.list({
          q: `'${yearFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(name)',
          orderBy: 'name',
        })

        if (monthFolders.data.files) {
          for (const folder of monthFolders.data.files) {
            const month = Number.parseInt(folder.name || '0')
            if (!Number.isNaN(month) && month >= 1 && month <= 12) {
              folders.push({
                baseFolder: baseFolderId,
                year,
                month,
                path: `${year}/${folder.name}`,
              })
            }
          }
        }
      }
    } else {
      // Get all year folders
      const yearFolders = await drive.files.list({
        q: `'${baseFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)',
        orderBy: 'name desc',
      })

      if (yearFolders.data.files) {
        for (const yearFolder of yearFolders.data.files) {
          const year = Number.parseInt(yearFolder.name || '0')
          if (!Number.isNaN(year)) {
            // Get month folders for this year
            const monthFolders = await drive.files.list({
              q: `'${yearFolder.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
              fields: 'files(name)',
              orderBy: 'name desc',
            })

            if (monthFolders.data.files) {
              for (const folder of monthFolders.data.files) {
                const month = Number.parseInt(folder.name || '0')
                if (!Number.isNaN(month) && month >= 1 && month <= 12) {
                  folders.push({
                    baseFolder: baseFolderId,
                    year,
                    month,
                    path: `${year}/${folder.name}`,
                  })
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      folders,
    })
  } catch (error) {
    console.error('Error getting folder structure:', error)

    return NextResponse.json(
      {
        error: 'Failed to get folders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
