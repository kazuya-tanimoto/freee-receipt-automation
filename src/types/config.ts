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
  }
}

export interface ConfigManager {
  getConfig(): AppConfig
  validateConfig(): boolean
}
