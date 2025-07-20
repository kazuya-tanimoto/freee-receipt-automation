/**
 * Google Drive File List Types and Interfaces
 * 
 * Type definitions for Google Drive file listing and search operations
 */

// ============================================================================
// Core Drive File Types
// ============================================================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: Date;
  modifiedTime: Date;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  isReceiptCandidate: boolean;
  confidenceScore: number;
  thumbnailLink?: string;
  fileExtension?: string;
  md5Checksum?: string;
}

export interface FileListParams {
  query?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
  spaces?: string;
  fields?: string;
  includeItemsFromAllDrives?: boolean;
}

export interface FileListResponse {
  files: DriveFile[];
  nextPageToken?: string;
  incompleteSearch?: boolean;
}

// ============================================================================
// Search and Processing Options
// ============================================================================

export interface ReceiptSearchCriteria {
  namePatterns: RegExp[];
  mimeTypes: string[];
  folderNames: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
}

export interface BatchProcessingOptions {
  batchSize: number;
  concurrency: number;
  delayMs: number;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_RECEIPT_CRITERIA: ReceiptSearchCriteria = {
  namePatterns: [
    /receipt/i,
    /invoice/i,
    /bill/i,
    /payment/i,
    /order/i,
    /purchase/i,
    /transaction/i,
    /領収書/i,
    /請求書/i,
    /明細/i,
    /レシート/i,
    /購入/i,
    /注文/i,
    /決済/i
  ],
  mimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/tiff',
    'image/bmp',
    'image/webp'
  ],
  folderNames: [
    'receipts',
    'invoices',
    'bills',
    'documents',
    'expenses',
    '領収書',
    '請求書',
    '書類',
    '経費'
  ]
};

export const DEFAULT_BATCH_OPTIONS: BatchProcessingOptions = {
  batchSize: 100,
  concurrency: 3,
  delayMs: 200
};

export const DEFAULT_FIELDS = 'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink, thumbnailLink, fileExtension, md5Checksum';