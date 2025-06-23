/**
 * Main Google Drive API Client
 * Integrates all Drive operations with error handling and retry logic
 */

import { DriveAuthManager } from './drive-auth';
import { DriveFileCreator } from './operations/file-create';
import { DriveFileLister } from './operations/file-list';
import { DriveFileGetter } from './operations/file-get';
import { DriveFileCategorizer } from './processors/file-categorizer';
import { 
  DriveOperationResult, 
  DriveStorageInfo, 
  DriveClientConfig, 
  DEFAULT_DRIVE_CONFIG,
  DriveError,
  DriveErrorType
} from './types';

export class DriveClient {
  private static instance: DriveClient;
  private authManager: DriveAuthManager;
  private driveInstance: any = null;
  private config: DriveClientConfig;
  
  // Operation handlers
  private fileCreator: DriveFileCreator | null = null;
  private fileLister: DriveFileLister | null = null;
  private fileGetter: DriveFileGetter | null = null;
  private fileCategorizer: DriveFileCategorizer;

  private constructor(config?: Partial<DriveClientConfig>) {
    this.config = { ...DEFAULT_DRIVE_CONFIG, ...config };
    this.authManager = DriveAuthManager.getInstance();
    this.fileCategorizer = new DriveFileCategorizer();
  }

  public static getInstance(config?: Partial<DriveClientConfig>): DriveClient {
    if (!DriveClient.instance) {
      DriveClient.instance = new DriveClient(config);
    }
    return DriveClient.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.authManager.initialize();
      await this.authManager.authenticate();
      
      if (!await this.authManager.verifyAuthentication()) {
        throw new Error('Authentication verification failed');
      }

      // Mock Drive instance - in real implementation, would be googleapis
      this.driveInstance = {
        files: {
          create: async () => ({}),
          list: async () => ({}),
          get: async () => ({})
        }
      };

      // Initialize operation handlers
      this.fileCreator = new DriveFileCreator(this.driveInstance);
      this.fileLister = new DriveFileLister(this.driveInstance);
      this.fileGetter = new DriveFileGetter(this.driveInstance);

    } catch (error) {
      throw this.createDriveError(
        DriveErrorType.AUTH_ERROR,
        'Failed to initialize Drive client',
        error
      );
    }
  }

  public getDrive(): any {
    if (!this.driveInstance) {
      throw this.createDriveError(
        DriveErrorType.AUTH_ERROR,
        'Drive client not initialized'
      );
    }
    return this.driveInstance;
  }

  public async getStorageInfo(): Promise<DriveOperationResult<DriveStorageInfo>> {
    try {
      // Simulate storage info retrieval
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        success: true,
        data: {
          limit: 15000000000, // 15GB
          usage: 5000000000,  // 5GB
          usageInDrive: 3000000000, // 3GB
          availableSpace: 10000000000 // 10GB
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      };
    }
  }

  public getFileCreator(): DriveFileCreator {
    if (!this.fileCreator) {
      throw this.createDriveError(
        DriveErrorType.AUTH_ERROR,
        'Drive client not initialized'
      );
    }
    return this.fileCreator;
  }

  public getFileLister(): DriveFileLister {
    if (!this.fileLister) {
      throw this.createDriveError(
        DriveErrorType.AUTH_ERROR,
        'Drive client not initialized'
      );
    }
    return this.fileLister;
  }

  public getFileGetter(): DriveFileGetter {
    if (!this.fileGetter) {
      throw this.createDriveError(
        DriveErrorType.AUTH_ERROR,
        'Drive client not initialized'
      );
    }
    return this.fileGetter;
  }

  public getFileCategorizer(): DriveFileCategorizer {
    return this.fileCategorizer;
  }

  public clear(): void {
    this.authManager.clear();
    this.driveInstance = null;
    this.fileCreator = null;
    this.fileLister = null;
    this.fileGetter = null;
  }

  private handleError(error: unknown): DriveError {
    if (typeof error === 'object' && error && 'code' in error) {
      const apiError = error as { code: number; message: string };
      
      switch (apiError.code) {
        case 401:
          return {
            type: DriveErrorType.AUTH_ERROR,
            message: 'Authentication failed',
            retryable: false
          };
        case 403:
          return {
            type: DriveErrorType.PERMISSION_DENIED,
            message: 'Insufficient permissions',
            retryable: false
          };
        case 404:
          return {
            type: DriveErrorType.FILE_NOT_FOUND,
            message: 'File not found',
            retryable: false
          };
        case 429:
          return {
            type: DriveErrorType.RATE_LIMIT_ERROR,
            message: 'Rate limit exceeded',
            retryable: true
          };
        case 507:
          return {
            type: DriveErrorType.STORAGE_FULL,
            message: 'Storage quota exceeded',
            retryable: false
          };
        default:
          return {
            type: DriveErrorType.UNKNOWN_ERROR,
            message: apiError.message || 'Unknown error occurred',
            retryable: false
          };
      }
    }

    return {
      type: DriveErrorType.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: false
    };
  }

  private createDriveError(
    type: DriveErrorType,
    message: string,
    originalError?: unknown
  ): DriveError {
    return {
      type,
      message,
      details: originalError ? { originalError } : undefined,
      retryable: type === DriveErrorType.NETWORK_ERROR || type === DriveErrorType.RATE_LIMIT_ERROR
    };
  }
}