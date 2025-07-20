/**
 * Google Drive File List Advanced Service
 * 
 * Advanced search functionality for Google Drive file operations
 */

import {
  DriveFile,
  FileListParams,
  FileListResponse
} from './file-list-types';
import {
  buildReceiptQuery,
  delay
} from './file-list-utils';
import { DriveFileListCore } from './file-list-core';

// ============================================================================
// DriveFileListAdvanced Implementation
// ============================================================================

export class DriveFileListAdvanced extends DriveFileListCore {
  /**
   * Search for receipt files specifically
   */
  async searchReceiptFiles(
    accessToken: string,
    params: Omit<FileListParams, 'query'> = {}
  ): Promise<FileListResponse> {
    const query = buildReceiptQuery(this.receiptCriteria);
    
    const result = await this.listFiles(accessToken, {
      ...params,
      query
    });

    // Filter and sort by confidence score
    const receiptFiles = result.files
      .filter(file => file.isReceiptCandidate)
      .sort((a, b) => b.confidenceScore - a.confidenceScore);

    return {
      ...result,
      files: receiptFiles
    };
  }

  /**
   * Get recent receipt files
   */
  async getRecentReceiptFiles(
    accessToken: string,
    daysBack: number = 30,
    maxResults: number = 100
  ): Promise<FileListResponse> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const query = `${buildReceiptQuery(this.receiptCriteria)} and modifiedTime >= '${startDate.toISOString()}'`;
    
    return this.listFiles(accessToken, {
      query,
      pageSize: maxResults,
      orderBy: 'modifiedTime desc'
    });
  }

  /**
   * Search receipt files in specific folders
   */
  async searchReceiptFolders(
    accessToken: string,
    params: Omit<FileListParams, 'query'> = {}
  ): Promise<FileListResponse> {
    const folderQueries = this.receiptCriteria.folderNames.map(
      folderName => `name contains '${folderName}'`
    ).join(' or ');
    
    const folderQuery = `(${folderQueries}) and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    
    const foldersResponse = await this.listFiles(accessToken, {
      query: folderQuery,
      fields: 'id, name'
    });

    if (foldersResponse.files.length === 0) {
      return { files: [] };
    }

    const allFiles: DriveFile[] = [];
    
    for (const folder of foldersResponse.files) {
      const filesInFolder = await this.getFilesInFolder(accessToken, folder.id, params);
      allFiles.push(...filesInFolder.files.filter(file => file.isReceiptCandidate));
    }

    return {
      files: allFiles.sort((a, b) => b.confidenceScore - a.confidenceScore)
    };
  }

  /**
   * Get all files with pagination handling
   */
  async getAllFiles(
    accessToken: string,
    query?: string,
    maxFiles: number = 1000
  ): Promise<DriveFile[]> {
    const allFiles: DriveFile[] = [];
    let pageToken: string | undefined;
    
    do {
      const response = await this.listFiles(accessToken, {
        query,
        pageToken,
        pageSize: Math.min(100, maxFiles - allFiles.length)
      });
      
      allFiles.push(...response.files);
      pageToken = response.nextPageToken;
      
      // Add delay between requests
      if (pageToken) {
        await delay(this.batchOptions.delayMs);
      }
      
    } while (pageToken && allFiles.length < maxFiles);

    return allFiles;
  }
}