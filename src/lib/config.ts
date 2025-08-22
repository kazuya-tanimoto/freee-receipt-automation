import type { AppConfig, ConfigManager } from '@/types/config'

/**
 * Type-safe environment variable reader with validation
 */
class ConfigService implements ConfigManager {
  private config: AppConfig | null = null

  /**
   * Get application configuration with validation
   */
  getConfig(): AppConfig {
    if (this.config) {
      return this.config
    }

    this.config = this.loadConfig()
    return this.config
  }

  /**
   * Validate all required environment variables are present
   */
  validateConfig(): boolean {
    try {
      this.getConfig()
      return true
    } catch {
      return false
    }
  }

  /**
   * Load and validate environment variables
   */
  private loadConfig(): AppConfig {
    const vision = this.getVisionConfig()
    const freee = this.getFreeeConfig()
    const gmail = this.getGmailConfig()
    const drive = this.getDriveConfig()

    return { vision, freee, gmail, drive }
  }

  /**
   * Get Google Vision API configuration
   */
  private getVisionConfig() {
    const apiKey = process.env.GOOGLE_VISION_API_KEY

    if (!apiKey) {
      throw new Error(
        'Missing Google Vision API key. Please set GOOGLE_VISION_API_KEY environment variable'
      )
    }

    return { apiKey }
  }

  /**
   * Get freee API configuration
   */
  private getFreeeConfig() {
    const clientId = process.env.FREEE_CLIENT_ID
    const clientSecret = process.env.FREEE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing freee API credentials. Please set FREEE_CLIENT_ID and FREEE_CLIENT_SECRET environment variables'
      )
    }

    return { clientId, clientSecret }
  }

  /**
   * Get Gmail API configuration
   */
  private getGmailConfig() {
    const clientId = process.env.GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing Gmail API credentials. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables'
      )
    }

    return { clientId, clientSecret }
  }

  /**
   * Get Google Drive API configuration
   */
  private getDriveConfig() {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    const inputFolderId = process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID
    const apiScopes = process.env.GOOGLE_DRIVE_API_SCOPES

    if (!apiKey) {
      throw new Error(
        'Missing Google Drive API key. Please set GOOGLE_DRIVE_API_KEY environment variable'
      )
    }

    if (!inputFolderId) {
      throw new Error(
        'Missing Google Drive input folder ID. Please set GOOGLE_DRIVE_INPUT_FOLDER_ID environment variable'
      )
    }

    if (!apiScopes) {
      throw new Error(
        'Missing Google Drive API scopes. Please set GOOGLE_DRIVE_API_SCOPES environment variable'
      )
    }

    return { apiKey, inputFolderId, apiScopes }
  }
}

export const configService = new ConfigService()
export const getConfig = () => configService.getConfig()
export const validateConfig = () => configService.validateConfig()
