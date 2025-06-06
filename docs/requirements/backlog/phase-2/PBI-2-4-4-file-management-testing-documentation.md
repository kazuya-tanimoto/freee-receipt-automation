# PBI-2-4-4: File Management Testing and Documentation

## Description
Create comprehensive testing suite and documentation for file management features including naming, folder structure, and duplicate handling. This ensures reliable file organization and provides clear guidance for users and developers on file management workflows.

## Implementation Details

### Files to Create/Modify
1. `tests/file-management/unit/` - Unit test files for file management modules
2. `tests/file-management/integration/` - Integration tests with Drive and storage
3. `tests/file-management/e2e/` - End-to-end file organization scenarios
4. `tests/file-management/mocks/` - Mock data and file samples
5. `docs/user/file-organization.md` - User guide for file organization
6. `docs/developer/file-management-api.md` - Developer API documentation
7. `docs/troubleshooting/file-issues.md` - Common file management issues

### Technical Requirements
- Achieve 90%+ test coverage for file management modules
- Test various file types and naming scenarios
- Mock file operations for reliable testing
- Create realistic test data for organization workflows
- Document file naming conventions and folder structure

### Unit Tests Structure
```typescript
// tests/file-management/unit/naming-strategy.test.ts
describe('FileNamingStrategy', () => {
  let namingStrategy: FileNamingStrategy;
  let vendorDetector: VendorDetector;
  
  beforeEach(() => {
    vendorDetector = new VendorDetector();
    namingStrategy = new FileNamingStrategy(NAMING_CONFIGS.default);
  });
  
  describe('generateFileName', () => {
    it('should generate filename with date prefix', () => {
      // Arrange
      const receipt: ReceiptData = {
        id: '123',
        vendor: 'Apple Inc',
        date: new Date('2025-06-15'),
        fileType: 'pdf',
        description: 'iTunes purchase'
      };
      
      // Act
      const fileName = namingStrategy.generateFileName(receipt);
      
      // Assert
      expect(fileName).toBe('2025-06-15_Apple_Inc.pdf');
    });
    
    it('should handle Japanese vendor names', () => {
      const receipt: ReceiptData = {
        id: '123',
        vendor: '株式会社セブンイレブン',
        date: new Date('2025-06-15'),
        fileType: 'pdf'
      };
      
      const fileName = namingStrategy.generateFileName(receipt);
      expect(fileName).toBe('2025-06-15_セブンイレブン.pdf');
    });
    
    it('should sanitize invalid characters', () => {
      const receipt: ReceiptData = {
        id: '123',
        vendor: 'Company <with> "special" chars',
        date: new Date('2025-06-15'),
        fileType: 'pdf'
      };
      
      const fileName = namingStrategy.generateFileName(receipt);
      expect(fileName).toBe('2025-06-15_Company_with_special_chars.pdf');
    });
    
    it('should truncate long names', () => {
      const receipt: ReceiptData = {
        id: '123',
        vendor: 'Very Long Company Name That Exceeds Maximum Length Limits',
        date: new Date('2025-06-15'),
        fileType: 'pdf'
      };
      
      const fileName = namingStrategy.generateFileName(receipt);
      expect(fileName.length).toBeLessThanOrEqual(60); // Date + 50 char limit + extension
    });
  });
  
  describe('vendor extraction', () => {
    it('should extract vendor from OCR text', () => {
      const ocrText = '株式会社セブンイレブン\n東京都渋谷区\nレシート';
      const vendor = vendorDetector.extractVendor(ocrText, 'ocr');
      expect(vendor).toBe('セブンイレブン');
    });
    
    it('should extract vendor from email', () => {
      const emailText = 'from: noreply@apple.com';
      const vendor = vendorDetector.extractVendor(emailText, 'email');
      expect(vendor).toBe('apple');
    });
  });
});

// tests/file-management/unit/folder-structure.test.ts
describe('FolderStructureManager', () => {
  let manager: FolderStructureManager;
  let mockDriveOps: jest.Mocked<DriveOperations>;
  
  beforeEach(() => {
    mockDriveOps = createMockDriveOperations();
    manager = new FolderStructureManager(
      FOLDER_STRUCTURE_CONFIG.default,
      mockDriveOps,
      mockLogger
    );
  });
  
  describe('ensureUserFolderStructure', () => {
    it('should create complete folder structure', async () => {
      // Mock folder creation responses
      mockDriveOps.createFolder
        .mockResolvedValueOnce({ id: 'root_123', name: 'freee-receipts' })
        .mockResolvedValueOnce({ id: 'receipts_123', name: '01.領収書' })
        .mockResolvedValueOnce({ id: 'assets_123', name: '99.固定資産分' });
      
      mockDriveOps.ensureFolder
        .mockImplementation(async (name) => `folder_${name}`);
      
      // Act
      const structure = await manager.ensureUserFolderStructure('user_123');
      
      // Assert
      expect(structure.receipts.rootFolderId).toBe('receipts_123');
      expect(structure.receipts.fixedAssetsFolderId).toBe('assets_123');
      expect(Object.keys(structure.receipts.monthlyFolders)).toHaveLength(12);
    });
    
    it('should handle existing folders', async () => {
      // Test finding existing folders instead of creating new ones
    });
  });
  
  describe('folder validation', () => {
    it('should detect missing folders', async () => {
      // Test folder structure validation
    });
    
    it('should repair broken structure', async () => {
      // Test structure repair functionality
    });
  });
});

// tests/file-management/unit/duplicate-detector.test.ts
describe('ContentDuplicateDetector', () => {
  let detector: ContentDuplicateDetector;
  
  beforeEach(() => {
    detector = new ContentDuplicateDetector(mockLogger);
  });
  
  describe('findDuplicates', () => {
    it('should detect exact duplicates by hash', async () => {
      const files = [
        createMockReceiptFile({ id: '1', file_size: 1000 }),
        createMockReceiptFile({ id: '2', file_size: 1000 }) // Same content
      ];
      
      jest.spyOn(detector as any, 'downloadFile')
        .mockResolvedValue(Buffer.from('same content'));
      
      const duplicates = await detector.findDuplicates('user_123');
      
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].type).toBe('exact_duplicate');
      expect(duplicates[0].files).toHaveLength(2);
    });
    
    it('should detect similar receipts by content', async () => {
      // Test similarity detection
    });
    
    it('should group duplicates correctly', async () => {
      // Test duplicate grouping logic
    });
  });
  
  describe('similarity calculation', () => {
    it('should calculate vendor similarity correctly', () => {
      const file1 = createMockReceiptFile({ vendor: 'Apple Inc' });
      const file2 = createMockReceiptFile({ vendor: 'Apple Store' });
      
      const similarity = (detector as any).compareReceipts(file1, file2);
      expect(similarity).toBeGreaterThan(0.8);
    });
    
    it('should calculate amount similarity correctly', () => {
      // Test amount-based similarity
    });
  });
});
```

### Integration Tests
```typescript
// tests/file-management/integration/file-organization.test.ts
describe('File Organization Integration', () => {
  let testAccount: TestAccount;
  let fileManager: FileManager;
  let testFolder: string;
  
  beforeAll(async () => {
    testAccount = await setupTestAccount();
    fileManager = new FileManager(testAccount.driveClient);
    testFolder = await createTestFolder('file-mgmt-test');
  });
  
  afterAll(async () => {
    await cleanupTestFolder(testFolder);
  });
  
  describe('complete file organization workflow', () => {
    it('should organize receipt from upload to final location', async () => {
      // 1. Create test receipt
      const receipt = await createTestReceipt({
        user_id: testAccount.userId,
        vendor: 'Test Vendor',
        transaction_date: new Date('2025-06-15'),
        description: 'Test receipt for organization'
      });
      
      // 2. Upload file
      const testFile = createTestPdfBuffer();
      const uploadResult = await fileManager.uploadFile(
        'test-receipt.pdf',
        testFile,
        'application/pdf',
        testFolder
      );
      
      // 3. Organize file
      const organizer = new ReceiptOrganizer(
        fileManager,
        folderManager,
        receiptService,
        logger
      );
      
      const organizationResult = await organizer.organizeReceipt(receipt.id);
      
      // 4. Verify organization
      expect(organizationResult.status).toBe('success');
      expect(organizationResult.filePath).toContain('06'); // June folder
      
      // 5. Verify file exists in correct location
      const structure = await getFolderStructure(testAccount.userId);
      const juneFiles = await fileManager.listFiles(structure.receipts.monthlyFolders['06']);
      
      expect(juneFiles.some(f => f.name.includes('Test_Vendor'))).toBe(true);
    });
    
    it('should handle duplicate files correctly', async () => {
      // Test duplicate detection and resolution
    });
    
    it('should maintain folder structure integrity', async () => {
      // Test folder structure maintenance
    });
  });
  
  describe('naming strategy integration', () => {
    it('should generate consistent names across different sources', async () => {
      // Test naming consistency
    });
    
    it('should handle various file types', async () => {
      // Test different file formats
    });
  });
});
```

### End-to-End Tests
```typescript
// tests/file-management/e2e/user-workflow.test.ts
describe('File Management User Workflow E2E', () => {
  it('should complete full receipt organization workflow', async () => {
    // 1. User uploads receipt
    const uploadResponse = await request(app)
      .post('/api/receipts/upload')
      .attach('file', 'tests/fixtures/sample-receipt.pdf')
      .expect(201);
    
    const receiptId = uploadResponse.body.receipt.id;
    
    // 2. OCR processing completes
    await waitForOCRCompletion(receiptId);
    
    // 3. File organization is triggered
    const organizeResponse = await request(app)
      .post('/api/files/organize')
      .send({ receiptIds: [receiptId] })
      .expect(200);
    
    // 4. Verify file is organized in Drive
    const receipt = await db.receipts.findUnique({
      where: { id: receiptId }
    });
    
    expect(receipt.drive_file_id).toBeDefined();
    expect(receipt.organized_at).toBeDefined();
    
    // 5. Verify folder structure
    const folderResponse = await request(app)
      .get('/api/folders/structure')
      .expect(200);
    
    expect(folderResponse.body.structure.receipts.monthlyFolders).toBeDefined();
    
    // 6. Verify file naming
    const driveFile = await getDriveFile(receipt.drive_file_id);
    expect(driveFile.name).toMatch(/^\d{4}-\d{2}-\d{2}_/); // Date prefix
  });
  
  it('should handle batch organization', async () => {
    // Test multiple receipt organization
  });
  
  it('should detect and resolve duplicates', async () => {
    // Test duplicate handling workflow
  });
});
```

### Performance Tests
```typescript
// tests/file-management/performance/organization-performance.test.ts
describe('File Organization Performance', () => {
  it('should organize multiple files efficiently', async () => {
    const startTime = Date.now();
    const receiptCount = 50;
    
    // Create test receipts
    const receipts = await createTestReceipts(receiptCount);
    
    // Organize all receipts
    const results = await Promise.allSettled(
      receipts.map(receipt => organizer.organizeReceipt(receipt.id))
    );
    
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    expect(successCount).toBeGreaterThan(receiptCount * 0.9); // 90% success rate
    expect(duration).toBeLessThan(60000); // Under 1 minute
  });
  
  it('should handle large file uploads efficiently', async () => {
    // Test with larger files
  });
  
  it('should perform duplicate detection efficiently', async () => {
    // Test duplicate detection performance
  });
});
```

### Documentation Structure
```markdown
# docs/user/file-organization.md
## File Organization Guide

### Automatic Organization
- How receipts are automatically organized
- Folder structure explanation
- File naming conventions

### Manual Organization
- Reorganizing files manually
- Changing folder structure
- Handling duplicates

### Best Practices
- File naming tips
- Folder organization strategies
- Managing storage space

# docs/developer/file-management-api.md
## File Management API

### Architecture Overview
- File naming strategy
- Folder structure management
- Duplicate handling logic

### API Reference
- Upload file: `POST /api/files/upload`
- Organize files: `POST /api/files/organize`
- Check duplicates: `GET /api/files/duplicates`
- Folder structure: `GET /api/folders/structure`

### Configuration
- Naming strategy configuration
- Folder structure settings
- Duplicate policies

### Integration Patterns
- File processing workflows
- Error handling strategies
- Performance optimization
```

### Mock Data and Utilities
```typescript
// tests/file-management/mocks/test-data.ts
export function createMockReceiptFile(overrides: Partial<ReceiptFile> = {}): ReceiptFile {
  return {
    id: 'receipt_' + Math.random().toString(36).substr(2, 9),
    user_id: 'user_123',
    vendor: 'Test Vendor',
    description: 'Test receipt',
    amount: 1000,
    transaction_date: new Date('2025-06-15'),
    file_name: 'test-receipt.pdf',
    file_size: 12345,
    mime_type: 'application/pdf',
    drive_file_id: 'drive_file_123',
    created_at: new Date(),
    ...overrides
  };
}

export function createTestPdfBuffer(): Buffer {
  // Create minimal valid PDF for testing
  return Buffer.from('%PDF-1.4\n%%EOF');
}

export const SAMPLE_OCR_TEXTS = {
  japanese: '株式会社セブンイレブン\n東京都渋谷区\n合計 ¥1,000',
  english: 'Apple Inc\nCupertino, CA\nTotal $9.99',
  receipt: 'Receipt\nDate: 2025-06-15\nAmount: $25.00'
};

export const SAMPLE_VENDOR_PATTERNS = {
  email_apple: 'from: noreply@email.apple.com',
  email_amazon: 'from: auto-confirm@amazon.com',
  japanese_company: '株式会社テスト会社',
  english_company: 'Test Company Inc.'
};
```

### Interface Specifications
- **Input Interfaces**: Tests all file management PBIs
- **Output Interfaces**: Provides test utilities for other components
  ```typescript
  export interface FileManagementTestUtilities {
    createMockReceiptFile(overrides?: Partial<ReceiptFile>): ReceiptFile;
    createTestPdfBuffer(): Buffer;
    setupTestFolderStructure(): Promise<UserFolderStructure>;
    cleanupTestData(): Promise<void>;
    generateTestReceipts(count: number): Promise<ReceiptFile[]>;
  }
  
  export interface OrganizationTestScenario {
    name: string;
    receipts: ReceiptFile[];
    expectedFolders: string[];
    expectedNames: string[];
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
- [ ] Unit test coverage is above 90% for all file management modules
- [ ] Integration tests validate complete organization workflows
- [ ] End-to-end tests cover user scenarios from upload to organization
- [ ] Performance tests validate organization speed and efficiency
- [ ] User documentation covers file organization and best practices
- [ ] Developer documentation includes all API endpoints and patterns

### Verification Commands
```bash
# Run all file management tests
npm run test:file-management
# Check test coverage
npm run test:coverage -- file-management
# Run integration tests
npm run test:integration:file-management
# Run E2E tests
npm run test:e2e:file-management
# Run performance tests
npm run test:performance:file-management
```

## Dependencies
- **Required**: PBI-2-4-1 through PBI-2-4-3 - All file management components
- **Required**: Test infrastructure and Drive test account

## Testing Requirements
- Unit tests: Test all file management modules with 90%+ coverage
- Integration tests: Test with real Drive API and file operations
- E2E tests: Test complete user workflows
- Performance tests: Validate organization speed and scalability

## Estimate
1 story point

## Priority
Medium - Testing and documentation ensure quality but don't block features

## Implementation Notes
- Create comprehensive test data for various file types and scenarios
- Use realistic file sizes and content for performance testing
- Include edge cases like network failures and quota limits
- Document performance benchmarks and optimization strategies
- Set up automated test runs in CI/CD pipeline
- Consider using visual regression testing for UI components
