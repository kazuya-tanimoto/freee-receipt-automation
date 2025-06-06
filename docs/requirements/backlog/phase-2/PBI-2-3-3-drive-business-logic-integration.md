# PBI-2-3-3: Google Drive Business Logic Integration

## Description
Integrate Google Drive operations with the receipt processing pipeline. This includes automatic file organization, metadata synchronization, folder structure maintenance, and integration with OCR and freee processing workflows.

## Implementation Details

### Files to Create/Modify
1. `src/lib/drive/receipt-organizer.ts` - Receipt file organization logic
2. `src/lib/drive/metadata-sync.ts` - Metadata synchronization with database
3. `src/lib/drive/file-processor.ts` - File processing orchestrator
4. `src/services/drive-sync.ts` - Background Drive synchronization service
5. `src/pages/api/drive/organize.ts` - File organization API endpoint
6. `src/pages/api/drive/sync.ts` - Sync API endpoint
7. `docs/drive/business-logic.md` - Business logic documentation

### Technical Requirements
- Automatically organize receipts by date and type
- Sync file metadata with database records
- Handle file moves and folder reorganization
- Integrate with OCR processing completion
- Support batch operations for multiple files

### Receipt Organization Logic
```typescript
export class ReceiptOrganizer {
  constructor(
    private driveFileManager: DriveFileManager,
    private folderManager: ReceiptFolderManager,
    private receiptService: ReceiptService,
    private logger: Logger
  ) {}
  
  async organizeReceipt(receiptId: string, driveFileId?: string): Promise<OrganizationResult> {
    const span = this.tracer.startSpan('drive.organize_receipt');
    
    try {
      // 1. Get receipt details
      const receipt = await this.receiptService.getReceipt(receiptId);
      if (!receipt) {
        throw new Error(`Receipt ${receiptId} not found`);
      }
      
      // 2. Get user's folder structure
      const structure = await this.folderManager.getFolderStructure(receipt.user_id);
      if (!structure) {
        await this.folderManager.setupReceiptFolders(receipt.user_id);
        structure = await this.folderManager.getFolderStructure(receipt.user_id);
      }
      
      // 3. Determine target folder
      const targetFolderId = this.getTargetFolder(receipt, structure);
      
      // 4. Upload or move file
      let driveFile: DriveFile;
      if (driveFileId) {
        // Move existing file
        driveFile = await this.moveFile(driveFileId, targetFolderId);
      } else {
        // Upload new file
        driveFile = await this.uploadReceipt(receipt, targetFolderId);
      }
      
      // 5. Update receipt record with Drive info
      await this.receiptService.updateReceipt(receiptId, {
        drive_file_id: driveFile.id,
        drive_file_path: this.buildFilePath(driveFile, structure),
        organized_at: new Date()
      });
      
      // 6. Update file metadata in Drive
      await this.updateFileMetadata(driveFile.id, receipt);
      
      return {
        receiptId,
        driveFileId: driveFile.id,
        targetFolder: targetFolderId,
        filePath: this.buildFilePath(driveFile, structure),
        status: 'success'
      };
    } catch (error) {
      this.logger.error('Failed to organize receipt', error, { receiptId });
      return {
        receiptId,
        status: 'failed',
        error: error.message
      };
    } finally {
      span.end();
    }
  }
  
  private getTargetFolder(receipt: Receipt, structure: FolderStructure): string {
    // Check if this is a fixed asset
    if (this.isFixedAsset(receipt)) {
      return structure.fixedAssetsFolderId;
    }
    
    // Use transaction date if available, otherwise creation date
    const targetDate = receipt.transaction_date || receipt.created_at;
    const month = targetDate.getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    
    return structure.monthlyFolders[monthStr];
  }
  
  private async uploadReceipt(receipt: Receipt, folderId: string): Promise<DriveFile> {
    // Read file from Supabase Storage
    const fileData = await this.storageService.download(receipt.file_path);
    
    // Generate filename
    const fileName = this.generateFileName(receipt);
    
    // Upload to Drive
    return await this.driveFileManager.uploadFile(
      fileName,
      fileData,
      receipt.mime_type || 'application/pdf',
      folderId,
      {
        description: `Receipt: ${receipt.description || 'Processed receipt'}`,
        source: 'freee-automation',
        customProperties: {
          receiptId: receipt.id,
          originalName: receipt.file_name,
          processedAt: new Date().toISOString(),
          amount: receipt.amount?.toString() || '',
          vendor: receipt.vendor || ''
        }
      }
    );
  }
  
  private generateFileName(receipt: Receipt): string {
    const date = receipt.transaction_date || receipt.created_at;
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Try to extract vendor/service name
    let baseName = receipt.vendor || receipt.description || 'receipt';
    
    // Clean filename (remove invalid characters)
    baseName = baseName.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    
    // Add date prefix
    const fileName = `${dateStr}_${baseName}`;
    
    // Add extension based on mime type
    const extension = this.getExtensionFromMimeType(receipt.mime_type);
    
    return `${fileName}${extension}`;
  }
}
```

### Metadata Synchronization
```typescript
export class DriveMetadataSync {
  constructor(
    private driveOps: DriveOperations,
    private receiptService: ReceiptService
  ) {}
  
  async syncReceiptMetadata(receiptId: string): Promise<void> {
    const receipt = await this.receiptService.getReceipt(receiptId);
    if (!receipt?.drive_file_id) return;
    
    // Update Drive file properties
    await this.driveOps.client.files.update({
      fileId: receipt.drive_file_id,
      requestBody: {
        properties: {
          receiptId: receipt.id,
          amount: receipt.amount?.toString() || '',
          vendor: receipt.vendor || '',
          category: receipt.category || '',
          processedAt: receipt.processed_at?.toISOString() || '',
          ocrStatus: receipt.ocr_status || '',
          transactionMatched: receipt.transaction_id ? 'true' : 'false',
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }
  
  async bulkSyncMetadata(userId: string): Promise<SyncResult> {
    const receipts = await this.receiptService.getReceiptsWithDriveFiles(userId);
    const results: MetadataSyncResult[] = [];
    
    for (const receipt of receipts) {
      try {
        await this.syncReceiptMetadata(receipt.id);
        results.push({ receiptId: receipt.id, status: 'success' });
      } catch (error) {
        results.push({ 
          receiptId: receipt.id, 
          status: 'failed', 
          error: error.message 
        });
      }
    }
    
    return {
      totalProcessed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }
}
```

### File Processing Integration
```typescript
export class DriveFileProcessor {
  constructor(
    private organizer: ReceiptOrganizer,
    private metadataSync: DriveMetadataSync,
    private eventBus: EventBus
  ) {}
  
  async processOCRCompletion(receiptId: string): Promise<void> {
    // Called when OCR processing completes
    try {
      // 1. Organize receipt file in Drive
      const result = await this.organizer.organizeReceipt(receiptId);
      
      if (result.status === 'success') {
        // 2. Sync metadata
        await this.metadataSync.syncReceiptMetadata(receiptId);
        
        // 3. Emit event for other services
        await this.eventBus.emit('receipt.organized', {
          receiptId,
          driveFileId: result.driveFileId,
          filePath: result.filePath
        });
      }
    } catch (error) {
      this.logger.error('Failed to process OCR completion', error, { receiptId });
      throw error;
    }
  }
  
  async processTransactionMatch(receiptId: string, transactionId: string): Promise<void> {
    // Called when receipt is matched with transaction
    try {
      // Update Drive file metadata to reflect matching
      await this.metadataSync.syncReceiptMetadata(receiptId);
      
      // Update file description to include transaction info
      const receipt = await this.receiptService.getReceipt(receiptId);
      if (receipt?.drive_file_id) {
        await this.driveOps.client.files.update({
          fileId: receipt.drive_file_id,
          requestBody: {
            description: `Receipt matched with transaction ${transactionId}: ${receipt.description}`
          }
        });
      }
    } catch (error) {
      this.logger.error('Failed to process transaction match', error, { 
        receiptId, 
        transactionId 
      });
    }
  }
}
```

### Batch Operations
```typescript
export class DriveBatchProcessor {
  async organizePendingReceipts(userId: string): Promise<BatchResult> {
    const pendingReceipts = await this.receiptService.getPendingOrganization(userId);
    const results: OrganizationResult[] = [];
    
    // Process in chunks to avoid API rate limits
    const chunks = this.chunkArray(pendingReceipts, 5);
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(receipt => this.organizer.organizeReceipt(receipt.id))
      );
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            receiptId: chunk[index].id,
            status: 'failed',
            error: result.reason.message
          });
        }
      });
      
      // Rate limiting delay
      await this.sleep(1000);
    }
    
    return {
      totalProcessed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

### API Endpoints
```typescript
// POST /api/drive/organize
interface OrganizeRequest {
  receiptIds: string[];
  force?: boolean; // Re-organize even if already organized
}

// POST /api/drive/sync
interface SyncRequest {
  syncType: 'metadata' | 'structure' | 'all';
  receiptIds?: string[]; // If not provided, sync all
}

// GET /api/drive/status
interface DriveStatusResponse {
  folderStructure: FolderStructure;
  organizedCount: number;
  pendingCount: number;
  lastSyncAt?: string;
}
```

### Interface Specifications
- **Input Interfaces**: Uses Drive operations from PBI-2-3-2
- **Output Interfaces**: Provides organized file management
  ```typescript
  export interface OrganizationResult {
    receiptId: string;
    driveFileId?: string;
    targetFolder?: string;
    filePath?: string;
    status: 'success' | 'failed';
    error?: string;
  }
  
  export interface BatchResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    results: OrganizationResult[];
  }
  
  export interface SyncResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    results: MetadataSyncResult[];
  }
  ```

## Metadata
- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-04
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria
- [ ] Receipts are automatically organized into correct monthly folders
- [ ] Fixed asset receipts are placed in the designated folder
- [ ] File metadata is synchronized with database records
- [ ] OCR completion triggers Drive organization
- [ ] Transaction matching updates Drive file metadata
- [ ] Batch processing handles multiple receipts efficiently

### Verification Commands
```bash
# Test receipt organization
npm run test:drive -- --grep "organization"
# Test metadata sync
curl -X POST http://localhost:3000/api/drive/sync -d '{"syncType":"metadata"}'
# Test batch organization
npm run test:integration -- drive-batch
```

## Dependencies
- **Required**: PBI-2-3-2 - Drive basic operations
- **Required**: PBI-1-2-3 - OCR service integration
- **Required**: PBI-1-1-2-A - Receipt database schema

## Testing Requirements
- Unit tests: Test organization logic and metadata sync
- Integration tests: Test end-to-end file organization
- Test data: Sample receipts with various types and dates

## Estimate
2 story points

## Priority
High - Core business logic for Drive file organization

## Implementation Notes
- Handle Japanese characters in filenames properly
- Implement proper error recovery for partial failures
- Add support for file versioning when files are updated
- Consider implementing file deduplication logic
- Test with various receipt types and date ranges
- Monitor Drive API quotas during batch operations
