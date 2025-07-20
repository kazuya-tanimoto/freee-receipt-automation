/**
 * Google Drive File List Service
 * 
 * Complete service for Google Drive file listing, searching, and receipt detection
 * Combines core and advanced functionality.
 */

import { GoogleOAuthProvider } from '../../oauth/providers/google-oauth-provider';
import {
  DriveFile,
  FileListParams,
  FileListResponse,
  ReceiptSearchCriteria,
  BatchProcessingOptions
} from './file-list-types';
import { DriveFileListAdvanced } from './file-list-advanced';

// ============================================================================
// DriveFileListService Implementation
// ============================================================================

export class DriveFileListService extends DriveFileListAdvanced {
  constructor(
    provider: GoogleOAuthProvider,
    options: {
      receiptCriteria?: Partial<ReceiptSearchCriteria>;
      batchOptions?: Partial<BatchProcessingOptions>;
    } = {}
  ) {
    super(provider, options);
  }

  // All methods are inherited from DriveFileListAdvanced and DriveFileListCore
  // This class serves as the main public interface
}