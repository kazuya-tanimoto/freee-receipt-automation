import type { DetectedFile, DriveFileDetection, DriveMonitorAPI } from '@/types/config'
import { google } from 'googleapis'
import { filterReceiptPDFs } from './file-detection'

/**
 * Google Drive folder monitoring for receipt PDF detection
 * Implements weekly folder checks with duplicate avoidance (90 lines max)
 */
interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webContentLink?: string
}

interface DriveListParams {
  q: string
  fields: string
  orderBy: string
  pageSize: number
}

interface DriveGetParams {
  fileId: string
  alt: string
}

interface DriveStreamData {
  on: (event: string, callback: (chunk?: Uint8Array) => void) => void
}

interface DriveAPI {
  files: {
    list: (params: DriveListParams) => Promise<{ data: { files?: GoogleDriveFile[] } }>
    get: (
      params: DriveGetParams,
      options?: { responseType: string }
    ) => Promise<{ data: DriveStreamData }>
  }
}

export class GoogleDriveMonitor implements DriveMonitorAPI {
  private drive: DriveAPI

  constructor(apiKey: string) {
    this.drive = google.drive({
      version: 'v3',
      auth: apiKey,
    }) as DriveAPI
  }

  /**
   * Detect new PDF files in specified Google Drive folder
   * @param config - Drive folder monitoring configuration
   * @returns Array of detected receipt PDF files
   */
  async detectNewPDFs(config: DriveFileDetection): Promise<DetectedFile[]> {
    try {
      const query = this.buildSearchQuery(config)

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,modifiedTime,webContentLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      })

      const files = response.data.files || []

      // Convert to DetectedFile format
      const detectedFiles: DetectedFile[] = files.map((file: GoogleDriveFile) => ({
        fileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType,
        modifiedTime: new Date(file.modifiedTime),
        downloadUrl: file.webContentLink || `https://drive.google.com/file/d/${file.id}/view`,
      }))

      // Filter for receipt PDFs only
      return filterReceiptPDFs(detectedFiles)
    } catch (error) {
      console.error('Error detecting PDFs from Google Drive:', error)
      throw new Error(
        `Failed to detect PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Download file content from Google Drive
   * @param fileId - Google Drive file ID
   * @returns File content as Buffer
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        {
          responseType: 'stream',
        }
      )

      const chunks: Uint8Array[] = []

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk?: Uint8Array) => {
          if (chunk) chunks.push(chunk)
        })
        response.data.on('end', () => resolve(Buffer.concat(chunks)))
        response.data.on('error', reject)
      })
    } catch (error) {
      console.error(`Error downloading file ${fileId}:`, error)
      throw new Error(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Build Google Drive API search query
   */
  private buildSearchQuery(config: DriveFileDetection): string {
    const folderQuery = `'${config.folderId}' in parents`
    const pdfQuery = "mimeType='application/pdf'"
    const notTrashedQuery = 'trashed=false'

    let query = `${folderQuery} and ${pdfQuery} and ${notTrashedQuery}`

    // Add time filter for incremental checks
    if (config.lastCheckTime) {
      const lastCheck = config.lastCheckTime.toISOString()
      query += ` and modifiedTime > '${lastCheck}'`
    }

    return query
  }
}
