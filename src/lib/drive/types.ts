/**
 * Google Drive API integration types and interfaces
 * @module DriveTypes
 */

export enum DriveErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  STORAGE_FULL = 'STORAGE_FULL',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface DriveError {
  type: DriveErrorType;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export interface DriveOperationResult<T> {
  success: boolean;
  data?: T;
  error?: DriveError;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  parents?: string[];
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  downloadUrl?: string;
}

export interface DriveStorageInfo {
  limit: number;
  usage: number;
  usageInDrive: number;
  availableSpace: number;
}

export interface DriveClientConfig {
  retryAttempts: number;
  retryDelay: number;
  rateLimit: number;
}

export interface FileUploadOptions {
  content?: Buffer | string;
  mimeType?: string;
  parents?: string[];
  metadata?: Record<string, unknown>;
}

export interface FileListOptions {
  query?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
  parents?: string[];
}

export interface FolderStructure {
  year: string;
  month: string;
  category: string;
}

// Default configurations
export const DEFAULT_DRIVE_CONFIG: DriveClientConfig = {
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimit: 100
};