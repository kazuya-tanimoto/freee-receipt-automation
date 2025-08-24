import { google } from 'googleapis'
import type { drive_v3 } from 'googleapis'

interface DriveFileInfo {
  name: string
  folderId: string
  fileId?: string
  webViewLink?: string
}

interface FolderStructure {
  baseFolder: string
  year: number
  month: number
  path: string
}

interface DriveStorage {
  saveReceipt(file: Buffer, originalName: string, date: Date): Promise<DriveFileInfo>
  createMonthlyFolder(date: Date): Promise<string>
  generateShortName(originalName: string): string
  checkDuplicate(folderId: string, filename: string): Promise<boolean>
}

/**
 * Google Drive storage for receipt file management (120 lines max)
 */
export class GoogleDriveStorage implements DriveStorage {
  private drive: drive_v3.Drive
  private baseFolderId: string

  constructor(apiKey: string, baseFolderId: string) {
    this.drive = google.drive({ version: 'v3', auth: apiKey })
    this.baseFolderId = baseFolderId
  }

  async saveReceipt(file: Buffer, originalName: string, date: Date): Promise<DriveFileInfo> {
    const monthlyFolderId = await this.createMonthlyFolder(date)
    const shortName = this.generateShortName(originalName)

    const isDuplicate = await this.checkDuplicate(monthlyFolderId, shortName)
    if (isDuplicate) throw new Error(`Duplicate file detected: ${shortName}`)

    const response = await this.drive.files.create({
      requestBody: { name: shortName, parents: [monthlyFolderId] },
      media: { mimeType: 'application/pdf', body: file },
      fields: 'id,name,webViewLink',
    })

    return {
      name: response.data.name || shortName,
      folderId: monthlyFolderId,
      fileId: response.data.id || undefined,
      webViewLink: response.data.webViewLink || undefined,
    }
  }

  async createMonthlyFolder(date: Date): Promise<string> {
    const year = date.getFullYear().toString()
    const month = String(date.getMonth() + 1).padStart(2, '0')

    const yearFolderId = await this.ensureFolderExists(this.baseFolderId, year)
    return await this.ensureFolderExists(yearFolderId, month)
  }

  generateShortName(originalName: string): string {
    const extension = originalName.includes('.') ? originalName.split('.').pop() : ''
    const baseName = originalName.replace(`.${extension}`, '')
    const cleanName = baseName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 40)

    return extension ? `${cleanName}.${extension}` : cleanName
  }

  async checkDuplicate(folderId: string, filename: string): Promise<boolean> {
    try {
      const response = await this.drive.files.list({
        q: `name='${filename}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id)',
      })
      return (response.data.files?.length || 0) > 0
    } catch {
      return false
    }
  }

  private async ensureFolderExists(parentId: string, folderName: string): Promise<string> {
    const query = `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    const response = await this.drive.files.list({ q: query, fields: 'files(id)' })

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id || ''
    }

    const createResponse = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
    })

    return createResponse.data.id || ''
  }
}

export type { DriveFileInfo, FolderStructure, DriveStorage }
