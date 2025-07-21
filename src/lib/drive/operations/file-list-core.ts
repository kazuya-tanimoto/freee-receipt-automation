/**
 * Google Drive File List Core Service
 * 
 * Core file listing functionality for Google Drive
 */

import { GoogleOAuth } from '../../oauth/google-oauth';
import { OAuthException } from '../../oauth/types';
import {
  DriveFile,
  FileListParams,
  FileListResponse,
  ReceiptSearchCriteria,
  BatchProcessingOptions,
  DEFAULT_RECEIPT_CRITERIA,
  DEFAULT_BATCH_OPTIONS,
  DEFAULT_FIELDS
} from './file-list-types';
import {
  processDriveFile,
  delay
} from './file-list-utils';

// ============================================================================
// DriveFileListCore Implementation
// ============================================================================

export class DriveFileListCore {
  protected readonly provider: GoogleOAuth;
  protected readonly receiptCriteria: ReceiptSearchCriteria;
  protected readonly batchOptions: BatchProcessingOptions;

  constructor(
    provider: GoogleOAuth,
    options: {
      receiptCriteria?: Partial<ReceiptSearchCriteria>;
      batchOptions?: Partial<BatchProcessingOptions>;
    } = {}
  ) {
    this.provider = provider;
    this.receiptCriteria = {
      ...DEFAULT_RECEIPT_CRITERIA,
      ...options.receiptCriteria
    };
    this.batchOptions = {
      ...DEFAULT_BATCH_OPTIONS,
      ...options.batchOptions
    };
  }

  /**
   * List Google Drive files with receipt detection
   */
  async listFiles(
    accessToken: string,
    params: FileListParams = {}
  ): Promise<FileListResponse> {
    return this.withRetry(async () => {
      const driveClient = this.provider.getDriveClient(accessToken);

      // Build query with default fields
      const fields = params.fields || DEFAULT_FIELDS;
      
      const response = await driveClient.listFiles({
        q: params.query,
        pageSize: params.pageSize || 100,
        pageToken: params.pageToken,
        orderBy: params.orderBy || 'modifiedTime desc',
        fields: `nextPageToken, incompleteSearch, files(${fields})`
      });

      const files = (response.files || []).map((file: any) => processDriveFile(file, this.receiptCriteria));

      return {
        files,
        nextPageToken: response.nextPageToken,
        incompleteSearch: response.incompleteSearch
      };
    });
  }

  /**
   * Search files by name pattern
   */
  async searchFilesByName(
    accessToken: string,
    namePattern: string,
    params: Omit<FileListParams, 'query'> = {}
  ): Promise<FileListResponse> {
    const query = `name contains '${namePattern}' and trashed = false`;
    
    return this.listFiles(accessToken, {
      ...params,
      query
    });
  }

  /**
   * Get files in specific folder
   */
  async getFilesInFolder(
    accessToken: string,
    folderId: string,
    params: Omit<FileListParams, 'query'> = {}
  ): Promise<FileListResponse> {
    const query = `'${folderId}' in parents and trashed = false`;
    
    return this.listFiles(accessToken, {
      ...params,
      query
    });
  }

  /**
   * Search files by MIME type
   */
  async getFilesByMimeType(
    accessToken: string,
    mimeType: string,
    params: Omit<FileListParams, 'query'> = {}
  ): Promise<FileListResponse> {
    const query = `mimeType = '${mimeType}' and trashed = false`;
    
    return this.listFiles(accessToken, {
      ...params,
      query
    });
  }

  /**
   * Get files modified within date range
   */
  async getFilesInDateRange(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    params: Omit<FileListParams, 'query'> = {}
  ): Promise<FileListResponse> {
    const query = `modifiedTime >= '${startDate.toISOString()}' and modifiedTime <= '${endDate.toISOString()}' and trashed = false`;
    
    return this.listFiles(accessToken, {
      ...params,
      query
    });
  }

  // ============================================================================
  // Protected Helper Methods
  // ============================================================================

  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = 3;
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof OAuthException && error.error === 'token_expired') {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, error);
        await delay(delayMs);
      }
    }

    throw lastError;
  }
}