/**
 * Application configuration type definitions
 */

export interface AppConfig {
  vision: {
    apiKey: string
  }
  freee: {
    clientId: string
    clientSecret: string
  }
  gmail: {
    clientId: string
    clientSecret: string
  }
  drive: {
    apiKey: string
    inputFolderId: string
    apiScopes: string
  }
}

export interface ConfigManager {
  getConfig(): AppConfig
  validateConfig(): boolean
}

/**
 * Google Drive file detection configuration
 */
export interface DriveFileDetection {
  folderId: string
  lastCheckTime?: Date
}

/**
 * Detected file information from Google Drive
 */
export interface DetectedFile {
  fileId: string
  fileName: string
  mimeType: string
  modifiedTime: Date
  downloadUrl: string
}

/**
 * Google Drive monitoring API interface
 */
export interface DriveMonitorAPI {
  detectNewPDFs(config: DriveFileDetection): Promise<DetectedFile[]>
  downloadFile(fileId: string): Promise<Buffer>
}
