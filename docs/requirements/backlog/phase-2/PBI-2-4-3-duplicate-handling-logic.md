# PBI-2-4-3: Duplicate Handling Logic

## Description
Implement comprehensive duplicate file detection and handling logic to prevent file conflicts and manage similar receipts. This includes filename collision resolution, content-based duplicate detection, and intelligent merging strategies for handling multiple versions of the same receipt.

## Implementation Details

### Files to Create/Modify
1. `src/lib/file-management/duplicate-detector.ts` - Duplicate detection logic
2. `src/lib/file-management/conflict-resolver.ts` - Filename conflict resolution
3. `src/lib/file-management/content-comparison.ts` - Content-based duplicate detection
4. `src/lib/file-management/merge-strategy.ts` - Duplicate merge strategies
5. `src/services/duplicate-cleanup.ts` - Background duplicate cleanup
6. `docs/file-management/duplicate-handling.md` - Duplicate handling documentation

### Technical Requirements
- Detect filename collisions and resolve automatically
- Identify content-based duplicates using file hashing
- Support multiple resolution strategies (rename, merge, skip)
- Handle partial duplicates and similar receipts
- Provide user-configurable duplicate policies

### Filename Collision Resolution
```typescript
export interface DuplicatePolicy {
  filenameCollision: 'rename' | 'overwrite' | 'skip' | 'prompt';
  contentDuplicate: 'merge' | 'keep_both' | 'keep_newer' | 'prompt';
  similarityThreshold: number; // 0.0 to 1.0
  autoResolve: boolean;
}

export class FilenameConflictResolver {
  constructor(
    private driveOps: DriveOperations,
    private policy: DuplicatePolicy
  ) {}
  
  async resolveFilenameConflict(
    targetName: string,
    folderId: string,
    newFileData: Buffer
  ): Promise<ConflictResolution> {
    // 1. Check if filename already exists
    const existingFiles = await this.findFilesWithName(targetName, folderId);
    
    if (existingFiles.length === 0) {
      return { action: 'proceed', finalName: targetName };
    }
    
    // 2. Check for content duplicates
    const contentDuplicate = await this.findContentDuplicate(newFileData, existingFiles);
    
    if (contentDuplicate) {
      return this.resolveContentDuplicate(contentDuplicate, newFileData);
    }
    
    // 3. Handle filename collision
    return this.resolveNameCollision(targetName, folderId);
  }
  
  private async findContentDuplicate(
    newFileData: Buffer,
    existingFiles: DriveFile[]
  ): Promise<DriveFile | null> {
    const newFileHash = this.calculateFileHash(newFileData);
    
    for (const file of existingFiles) {
      try {
        const existingData = await this.driveOps.downloadFile(file.id);
        const existingHash = this.calculateFileHash(existingData);
        
        if (newFileHash === existingHash) {
          return file;
        }
      } catch (error) {
        this.logger.warn('Failed to download file for comparison', { fileId: file.id });
      }
    }
    
    return null;
  }
  
  private resolveContentDuplicate(
    existingFile: DriveFile,
    newFileData: Buffer
  ): ConflictResolution {
    switch (this.policy.contentDuplicate) {
      case 'skip':
        return {
          action: 'skip',
          reason: 'Identical content already exists',
          existingFileId: existingFile.id
        };
      
      case 'keep_newer':
        return {
          action: 'overwrite',
          reason: 'Newer version of same content',
          targetFileId: existingFile.id
        };
      
      case 'merge':
        return {
          action: 'merge',
          reason: 'Merge metadata from both files',
          existingFileId: existingFile.id
        };
      
      default:
        return {
          action: 'keep_both',
          finalName: this.generateUniqueFilename(existingFile.name, existingFile.parentId!)
        };
    }
  }
  
  private async resolveNameCollision(targetName: string, folderId: string): Promise<ConflictResolution> {
    switch (this.policy.filenameCollision) {
      case 'rename':
        const uniqueName = await this.generateUniqueFilename(targetName, folderId);
        return { action: 'proceed', finalName: uniqueName };
      
      case 'overwrite':
        return { action: 'overwrite', finalName: targetName };
      
      case 'skip':
        return { action: 'skip', reason: 'File with same name already exists' };
      
      default:
        return { action: 'prompt', finalName: targetName };
    }
  }
  
  private async generateUniqueFilename(fileName: string, folderId: string): Promise<string> {
    const { name, extension } = this.parseFileName(fileName);
    let counter = 1;
    let candidateName = fileName;
    
    while (await this.fileExists(candidateName, folderId)) {
      counter++;
      candidateName = `${name}_${counter}${extension}`;
    }
    
    return candidateName;
  }
  
  private calculateFileHash(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
```

### Content-Based Duplicate Detection
```typescript
export class ContentDuplicateDetector {
  constructor(private logger: Logger) {}
  
  async findDuplicates(userId: string): Promise<DuplicateGroup[]> {
    // 1. Get all user's receipt files
    const receiptFiles = await this.getAllReceiptFiles(userId);
    
    // 2. Group by file hash
    const hashGroups = await this.groupByContentHash(receiptFiles);
    
    // 3. Find similar files (not exact duplicates)
    const similarGroups = await this.findSimilarFiles(receiptFiles);
    
    return [...hashGroups, ...similarGroups];
  }
  
  private async groupByContentHash(files: ReceiptFile[]): Promise<DuplicateGroup[]> {
    const hashGroups = new Map<string, ReceiptFile[]>();
    
    for (const file of files) {
      try {
        const data = await this.downloadFile(file.driveFileId);
        const hash = this.calculateFileHash(data);
        
        if (!hashGroups.has(hash)) {
          hashGroups.set(hash, []);
        }
        hashGroups.get(hash)!.push(file);
      } catch (error) {
        this.logger.warn('Failed to hash file', error, { fileId: file.id });
      }
    }
    
    // Return only groups with multiple files
    return Array.from(hashGroups.values())
      .filter(group => group.length > 1)
      .map(files => ({
        type: 'exact_duplicate',
        files,
        similarity: 1.0,
        suggestedAction: 'keep_newest'
      }));
  }
  
  private async findSimilarFiles(files: ReceiptFile[]): Promise<DuplicateGroup[]> {
    const similarGroups: DuplicateGroup[] = [];
    
    // Group by vendor and date proximity
    const vendorGroups = this.groupByVendor(files);
    
    for (const [vendor, vendorFiles] of vendorGroups) {
      const dateGroups = this.groupByDateProximity(vendorFiles, 7); // 7 days
      
      for (const dateGroup of dateGroups) {
        if (dateGroup.length > 1) {
          const similarity = await this.calculateGroupSimilarity(dateGroup);
          
          if (similarity > 0.8) {
            similarGroups.push({
              type: 'similar_content',
              files: dateGroup,
              similarity,
              suggestedAction: 'review_manual',
              metadata: { vendor, dateRange: this.getDateRange(dateGroup) }
            });
          }
        }
      }
    }
    
    return similarGroups;
  }
  
  private async calculateGroupSimilarity(files: ReceiptFile[]): Promise<number> {
    // Compare amounts, vendors, and OCR content
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const similarity = this.compareReceipts(files[i], files[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }
  
  private compareReceipts(file1: ReceiptFile, file2: ReceiptFile): number {
    let score = 0;
    let factors = 0;
    
    // Compare vendor
    if (file1.vendor && file2.vendor) {
      score += this.stringSimilarity(file1.vendor, file2.vendor);
      factors++;
    }
    
    // Compare amount
    if (file1.amount !== null && file2.amount !== null) {
      const amountSimilarity = 1 - Math.abs(file1.amount - file2.amount) / Math.max(file1.amount, file2.amount);
      score += Math.max(0, amountSimilarity);
      factors++;
    }
    
    // Compare OCR content
    if (file1.ocrText && file2.ocrText) {
      score += this.textSimilarity(file1.ocrText, file2.ocrText);
      factors++;
    }
    
    return factors > 0 ? score / factors : 0;
  }
}
```

### Duplicate Merge Strategies
```typescript
export class DuplicateMergeStrategy {
  async mergeDuplicates(duplicateGroup: DuplicateGroup): Promise<MergeResult> {
    const strategy = this.selectMergeStrategy(duplicateGroup);
    
    switch (strategy) {
      case 'keep_newest':
        return this.keepNewestFile(duplicateGroup);
      
      case 'keep_largest':
        return this.keepLargestFile(duplicateGroup);
      
      case 'merge_metadata':
        return this.mergeMetadata(duplicateGroup);
      
      case 'keep_best_quality':
        return this.keepBestQuality(duplicateGroup);
      
      default:
        return this.requireManualReview(duplicateGroup);
    }
  }
  
  private selectMergeStrategy(group: DuplicateGroup): MergeStrategyType {
    // Exact duplicates - keep newest
    if (group.type === 'exact_duplicate') {
      return 'keep_newest';
    }
    
    // Similar content - require review if high value
    if (group.files.some(f => (f.amount || 0) > 50000)) {
      return 'manual_review';
    }
    
    // Low value similar receipts - merge metadata
    return 'merge_metadata';
  }
  
  private async keepNewestFile(group: DuplicateGroup): Promise<MergeResult> {
    const sorted = group.files.sort((a, b) => 
      b.created_at.getTime() - a.created_at.getTime()
    );
    
    const keepFile = sorted[0];
    const deleteFiles = sorted.slice(1);
    
    // Delete older duplicates
    for (const file of deleteFiles) {
      await this.deleteFile(file);
    }
    
    return {
      action: 'merged',
      keptFile: keepFile,
      deletedFiles: deleteFiles,
      strategy: 'keep_newest'
    };
  }
  
  private async mergeMetadata(group: DuplicateGroup): Promise<MergeResult> {
    // Keep the file with best metadata, merge missing information
    const bestFile = this.selectBestFile(group.files);
    const mergedMetadata = this.mergeFileMetadata(group.files);
    
    // Update the best file with merged metadata
    await this.updateFileMetadata(bestFile, mergedMetadata);
    
    // Delete other files
    const deleteFiles = group.files.filter(f => f.id !== bestFile.id);
    for (const file of deleteFiles) {
      await this.deleteFile(file);
    }
    
    return {
      action: 'merged',
      keptFile: bestFile,
      deletedFiles: deleteFiles,
      strategy: 'merge_metadata',
      mergedMetadata
    };
  }
  
  private selectBestFile(files: ReceiptFile[]): ReceiptFile {
    // Score files based on completeness and quality
    return files.reduce((best, current) => {
      const bestScore = this.calculateFileScore(best);
      const currentScore = this.calculateFileScore(current);
      return currentScore > bestScore ? current : best;
    });
  }
  
  private calculateFileScore(file: ReceiptFile): number {
    let score = 0;
    
    // Metadata completeness
    if (file.vendor) score += 2;
    if (file.amount) score += 2;
    if (file.category) score += 1;
    if (file.ocrText && file.ocrText.length > 100) score += 2;
    if (file.transaction_id) score += 3; // Already matched
    
    // File quality indicators
    if (file.file_size > 50000) score += 1; // Larger files often better quality
    if (file.mime_type === 'application/pdf') score += 1; // PDFs preferred over images
    
    return score;
  }
}
```

### Background Cleanup Service
```typescript
export class DuplicateCleanupService {
  constructor(
    private detector: ContentDuplicateDetector,
    private mergeStrategy: DuplicateMergeStrategy
  ) {}
  
  async scheduledCleanup(): Promise<CleanupReport> {
    const users = await this.getUsersForCleanup();
    const reports: UserCleanupReport[] = [];
    
    for (const userId of users) {
      try {
        const report = await this.cleanupUserDuplicates(userId);
        reports.push(report);
        
        // Rate limiting
        await this.sleep(2000);
      } catch (error) {
        this.logger.error('Duplicate cleanup failed for user', error, { userId });
      }
    }
    
    return this.aggregateReports(reports);
  }
  
  private async cleanupUserDuplicates(userId: string): Promise<UserCleanupReport> {
    const duplicateGroups = await this.detector.findDuplicates(userId);
    const mergeResults: MergeResult[] = [];
    
    for (const group of duplicateGroups) {
      // Only auto-merge if policy allows
      if (group.suggestedAction !== 'review_manual') {
        try {
          const result = await this.mergeStrategy.mergeDuplicates(group);
          mergeResults.push(result);
        } catch (error) {
          this.logger.warn('Failed to merge duplicate group', error, { userId });
        }
      }
    }
    
    return {
      userId,
      duplicatesFound: duplicateGroups.length,
      autoMerged: mergeResults.filter(r => r.action === 'merged').length,
      manualReviewRequired: duplicateGroups.filter(g => g.suggestedAction === 'review_manual').length,
      spaceSaved: this.calculateSpaceSaved(mergeResults)
    };
  }
}
```

### Interface Specifications
- **Input Interfaces**: Requires file data and Drive operations
- **Output Interfaces**: Provides duplicate resolution for file management
  ```typescript
  export interface ConflictResolution {
    action: 'proceed' | 'skip' | 'overwrite' | 'merge' | 'prompt';
    finalName?: string;
    reason?: string;
    existingFileId?: string;
    targetFileId?: string;
  }
  
  export interface DuplicateGroup {
    type: 'exact_duplicate' | 'similar_content';
    files: ReceiptFile[];
    similarity: number;
    suggestedAction: 'keep_newest' | 'merge_metadata' | 'review_manual';
    metadata?: Record<string, any>;
  }
  
  export interface MergeResult {
    action: 'merged' | 'skipped' | 'manual_review';
    keptFile?: ReceiptFile;
    deletedFiles?: ReceiptFile[];
    strategy?: string;
    mergedMetadata?: Record<string, any>;
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
- [ ] Filename collisions are automatically resolved with numbering
- [ ] Content-based duplicates are detected using file hashing
- [ ] Similar receipts are identified and grouped for review
- [ ] Multiple merge strategies are supported and configurable
- [ ] Background cleanup removes obvious duplicates automatically
- [ ] Manual review is required for high-value or ambiguous cases

### Verification Commands
```bash
# Test duplicate detection
npm run test:duplicate-detection
# Test conflict resolution
npm run test:filename-conflicts
# Test merge strategies
npm run test:duplicate-merge
```

## Dependencies
- **Required**: PBI-2-3-2 - Drive basic operations for file access
- **Required**: PBI-1-1-2-A - Receipt database for metadata comparison

## Testing Requirements
- Unit tests: Test duplicate detection algorithms and merge strategies
- Integration tests: Test with real duplicate files in Drive
- Test data: Various types of duplicate and similar receipts

## Estimate
1 story point

## Priority
Medium - Important for clean file organization but not blocking

## Implementation Notes
- Use file hashing for exact duplicate detection
- Implement fuzzy matching for similar content detection
- Consider machine learning for similarity scoring
- Add user preferences for duplicate handling policies
- Monitor storage space savings from duplicate cleanup
- Test with various file formats and sizes
