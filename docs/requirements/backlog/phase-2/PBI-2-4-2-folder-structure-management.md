# PBI-2-4-2: Folder Structure Management

## Description
Implement comprehensive folder structure management to maintain the organized receipt filing system. This includes automatic creation and maintenance of monthly folders, fixed asset folders, and hierarchical organization that follows the established pattern (/01.領収書/MM/ and /99.固定資産分/).

## Implementation Details

### Files to Create/Modify
1. `src/lib/file-management/folder-structure.ts` - Folder structure management
2. `src/lib/file-management/folder-monitor.ts` - Folder integrity monitoring
3. `src/lib/file-management/structure-validator.ts` - Structure validation
4. `src/lib/file-management/folder-creator.ts` - Automated folder creation
5. `src/services/folder-maintenance.ts` - Background folder maintenance
6. `docs/file-management/folder-structure.md` - Structure documentation

### Technical Requirements
- Maintain consistent folder hierarchy across users
- Automatically create missing monthly folders
- Monitor and repair folder structure integrity
- Support configurable folder patterns
- Handle folder renaming and restructuring

### Folder Structure Definition
```typescript
export interface FolderStructureConfig {
  patterns: {
    receipts: {
      root: string;
      monthly: string;
      fixedAssets: string;
    };
    archive: {
      root: string;
      yearly: string;
    };
  };
  rules: {
    autoCreateMonthly: boolean;
    autoCreateYearly: boolean;
    maxDepth: number;
    allowCustomFolders: boolean;
  };
  naming: {
    monthFormat: 'MM' | 'YYYY-MM' | 'MM-MMMM';
    yearFormat: 'YYYY';
    locale: 'ja-JP' | 'en-US';
  };
}

export class FolderStructureManager {
  constructor(
    private config: FolderStructureConfig,
    private driveOps: DriveOperations,
    private logger: Logger
  ) {}
  
  async ensureUserFolderStructure(userId: string): Promise<UserFolderStructure> {
    const span = this.tracer.startSpan('folder.ensure_structure');
    
    try {
      // 1. Get or create root folder
      const rootFolderId = await this.ensureRootFolder(userId);
      
      // 2. Create receipt folders structure
      const receiptStructure = await this.ensureReceiptFolders(rootFolderId);
      
      // 3. Create archive structure if configured
      const archiveStructure = await this.ensureArchiveFolders(rootFolderId);
      
      // 4. Save structure to database
      const structure: UserFolderStructure = {
        userId,
        rootFolderId,
        receipts: receiptStructure,
        archive: archiveStructure,
        createdAt: new Date(),
        lastValidated: new Date()
      };
      
      await this.saveFolderStructure(structure);
      
      return structure;
    } finally {
      span.end();
    }
  }
  
  private async ensureRootFolder(userId: string): Promise<string> {
    const rootFolderName = 'freee-receipts';
    
    // Try to find existing root folder
    let rootFolder = await this.driveOps.findFolder(rootFolderName);
    
    if (!rootFolder) {
      rootFolder = await this.driveOps.createFolder(rootFolderName);
      this.logger.info('Created root folder', { userId, folderId: rootFolder.id });
    }
    
    return rootFolder.id;
  }
  
  private async ensureReceiptFolders(rootFolderId: string): Promise<ReceiptFolderStructure> {
    // 1. Create main receipts folder
    const receiptsFolder = await this.driveOps.ensureFolder(
      this.config.patterns.receipts.root,
      rootFolderId
    );
    
    // 2. Create monthly folders
    const monthlyFolders = await this.createMonthlyFolders(receiptsFolder);
    
    // 3. Create fixed assets folder
    const fixedAssetsFolder = await this.driveOps.ensureFolder(
      this.config.patterns.receipts.fixedAssets,
      rootFolderId
    );
    
    return {
      rootFolderId: receiptsFolder,
      monthlyFolders,
      fixedAssetsFolderId: fixedAssetsFolder
    };
  }
  
  private async createMonthlyFolders(parentFolderId: string): Promise<Record<string, string>> {
    const monthlyFolders: Record<string, string> = {};
    
    if (this.config.rules.autoCreateMonthly) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = this.formatMonthName(month);
        const folderId = await this.driveOps.ensureFolder(monthStr, parentFolderId);
        monthlyFolders[month.toString().padStart(2, '0')] = folderId;
      }
    }
    
    return monthlyFolders;
  }
  
  private formatMonthName(month: number): string {
    const monthStr = month.toString().padStart(2, '0');
    
    switch (this.config.naming.monthFormat) {
      case 'MM':
        return monthStr;
      case 'YYYY-MM':
        return `${new Date().getFullYear()}-${monthStr}`;
      case 'MM-MMMM':
        const monthNames = {
          'ja-JP': ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
          'en-US': ['01-Jan', '02-Feb', '03-Mar', '04-Apr', '05-May', '06-Jun', '07-Jul', '08-Aug', '09-Sep', '10-Oct', '11-Nov', '12-Dec']
        };
        return monthNames[this.config.naming.locale][month - 1];
      default:
        return monthStr;
    }
  }
}
```

### Folder Integrity Monitor
```typescript
export class FolderIntegrityMonitor {
  constructor(
    private structureManager: FolderStructureManager,
    private driveOps: DriveOperations
  ) {}
  
  async validateStructure(userId: string): Promise<ValidationResult> {
    const structure = await this.getFolderStructure(userId);
    if (!structure) {
      return { valid: false, issues: ['No folder structure found'] };
    }
    
    const issues: string[] = [];
    
    // 1. Check root folder exists
    const rootExists = await this.checkFolderExists(structure.rootFolderId);
    if (!rootExists) {
      issues.push('Root folder missing');
    }
    
    // 2. Check receipt folders
    const receiptIssues = await this.validateReceiptFolders(structure.receipts);
    issues.push(...receiptIssues);
    
    // 3. Check for orphaned files
    const orphanedFiles = await this.findOrphanedFiles(structure);
    if (orphanedFiles.length > 0) {
      issues.push(`Found ${orphanedFiles.length} orphaned files`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      lastChecked: new Date(),
      orphanedFiles
    };
  }
  
  async repairStructure(userId: string): Promise<RepairResult> {
    const validation = await this.validateStructure(userId);
    if (validation.valid) {
      return { repaired: false, actions: [] };
    }
    
    const actions: RepairAction[] = [];
    
    // Recreate missing folders
    if (validation.issues.includes('Root folder missing')) {
      await this.structureManager.ensureUserFolderStructure(userId);
      actions.push({ type: 'folder_created', target: 'root' });
    }
    
    // Move orphaned files
    if (validation.orphanedFiles && validation.orphanedFiles.length > 0) {
      for (const file of validation.orphanedFiles) {
        await this.moveOrphanedFile(file, userId);
        actions.push({ type: 'file_moved', target: file.id });
      }
    }
    
    return { repaired: true, actions };
  }
  
  private async validateReceiptFolders(receipts: ReceiptFolderStructure): Promise<string[]> {
    const issues: string[] = [];
    
    // Check main receipts folder
    if (!await this.checkFolderExists(receipts.rootFolderId)) {
      issues.push('Main receipts folder missing');
    }
    
    // Check monthly folders
    for (const [month, folderId] of Object.entries(receipts.monthlyFolders)) {
      if (!await this.checkFolderExists(folderId)) {
        issues.push(`Monthly folder ${month} missing`);
      }
    }
    
    // Check fixed assets folder
    if (!await this.checkFolderExists(receipts.fixedAssetsFolderId)) {
      issues.push('Fixed assets folder missing');
    }
    
    return issues;
  }
  
  private async findOrphanedFiles(structure: UserFolderStructure): Promise<OrphanedFile[]> {
    const orphaned: OrphanedFile[] = [];
    
    // Get all files in user's drive space
    const allFiles = await this.driveOps.listFiles(structure.rootFolderId, undefined, true);
    
    // Check if each file is in a valid location
    for (const file of allFiles) {
      if (!this.isFileInValidLocation(file, structure)) {
        orphaned.push({
          id: file.id,
          name: file.name,
          currentParent: file.parentId,
          suggestedLocation: await this.suggestFileLocation(file, structure)
        });
      }
    }
    
    return orphaned;
  }
}
```

### Folder Maintenance Service
```typescript
export class FolderMaintenanceService {
  constructor(
    private monitor: FolderIntegrityMonitor,
    private structureManager: FolderStructureManager
  ) {}
  
  async performMaintenanceCheck(userId: string): Promise<MaintenanceReport> {
    const startTime = Date.now();
    
    try {
      // 1. Validate current structure
      const validation = await this.monitor.validateStructure(userId);
      
      // 2. Repair if needed
      let repair: RepairResult | null = null;
      if (!validation.valid) {
        repair = await this.monitor.repairStructure(userId);
      }
      
      // 3. Update folder access times
      await this.updateAccessTimes(userId);
      
      // 4. Clean up empty folders
      const cleanup = await this.cleanupEmptyFolders(userId);
      
      return {
        userId,
        executedAt: new Date(),
        duration: Date.now() - startTime,
        validation,
        repair,
        cleanup,
        nextCheckDue: this.calculateNextCheck()
      };
    } catch (error) {
      this.logger.error('Folder maintenance failed', error, { userId });
      throw error;
    }
  }
  
  async scheduledMaintenance(): Promise<void> {
    // Get all users needing maintenance
    const users = await this.getUsersNeedingMaintenance();
    
    for (const userId of users) {
      try {
        await this.performMaintenanceCheck(userId);
        
        // Rate limiting between users
        await this.sleep(1000);
      } catch (error) {
        this.logger.error('Scheduled maintenance failed for user', error, { userId });
      }
    }
  }
  
  private async cleanupEmptyFolders(userId: string): Promise<CleanupResult> {
    const structure = await this.getFolderStructure(userId);
    if (!structure) return { cleaned: 0, folders: [] };
    
    const emptyFolders = await this.findEmptyFolders(structure);
    const cleanedFolders: string[] = [];
    
    for (const folderId of emptyFolders) {
      // Don't delete structural folders
      if (this.isStructuralFolder(folderId, structure)) {
        continue;
      }
      
      try {
        await this.driveOps.deleteFolder(folderId);
        cleanedFolders.push(folderId);
      } catch (error) {
        this.logger.warn('Failed to delete empty folder', error, { folderId });
      }
    }
    
    return { cleaned: cleanedFolders.length, folders: cleanedFolders };
  }
}
```

### API Endpoints
```typescript
// GET /api/folders/structure
interface FolderStructureResponse {
  structure: UserFolderStructure;
  validation: ValidationResult;
  lastMaintenance?: Date;
}

// POST /api/folders/repair
interface RepairFoldersRequest {
  force?: boolean;
  repairTypes?: ('missing_folders' | 'orphaned_files' | 'empty_folders')[];
}

// POST /api/folders/maintenance
interface MaintenanceRequest {
  immediate?: boolean;
}
```

### Interface Specifications
- **Input Interfaces**: Requires Drive operations from PBI-2-3-2
- **Output Interfaces**: Provides folder management for file organization
  ```typescript
  export interface UserFolderStructure {
    userId: string;
    rootFolderId: string;
    receipts: ReceiptFolderStructure;
    archive?: ArchiveFolderStructure;
    createdAt: Date;
    lastValidated: Date;
  }
  
  export interface ReceiptFolderStructure {
    rootFolderId: string;
    monthlyFolders: Record<string, string>; // MM -> folderId
    fixedAssetsFolderId: string;
  }
  
  export interface ValidationResult {
    valid: boolean;
    issues: string[];
    lastChecked: Date;
    orphanedFiles?: OrphanedFile[];
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
- [ ] Monthly folders (01-12) are automatically created
- [ ] Fixed assets folder (99.固定資産分) is created and maintained
- [ ] Folder structure integrity is monitored and validated
- [ ] Missing folders are automatically recreated
- [ ] Orphaned files are detected and relocated
- [ ] Empty folders are cleaned up during maintenance

### Verification Commands
```bash
# Test folder structure creation
npm run test:folder-structure
# Test structure validation
npm run test:folder-validation
# Test maintenance operations
npm run test:folder-maintenance
```

## Dependencies
- **Required**: PBI-2-3-2 - Drive basic operations
- **Required**: PBI-1-1-2-A - User data for folder association

## Testing Requirements
- Unit tests: Test folder structure logic and validation
- Integration tests: Test with real Drive API folder operations
- Test data: Various folder structure scenarios

## Estimate
1 story point

## Priority
High - Proper folder structure required for file organization

## Implementation Notes
- Support both Japanese and English folder naming
- Implement proper error recovery for folder creation failures
- Add metrics for folder structure health
- Consider implementing folder access permissions
- Test with various Drive quota scenarios
- Handle concurrent folder creation conflicts
