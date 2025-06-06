# PBI-2-3-5: Google Drive Testing and Documentation

## Description
Create comprehensive testing suite and documentation for Google Drive API integration. This includes unit tests, integration tests, end-to-end testing scenarios, and complete user and developer documentation covering file organization and management workflows.

## Implementation Details

### Files to Create/Modify
1. `tests/drive/unit/` - Unit test files for Drive modules
2. `tests/drive/integration/` - Integration tests with Drive API
3. `tests/drive/e2e/` - End-to-end file organization scenarios
4. `tests/drive/mocks/` - Mock data and Drive API responses
5. `docs/user/drive-setup.md` - User setup and organization guide
6. `docs/developer/drive-api.md` - Developer API documentation
7. `docs/troubleshooting/drive-issues.md` - Common issues and solutions

### Technical Requirements
- Achieve 90%+ test coverage for Drive modules
- Test file organization and folder management
- Mock Drive API responses for reliable testing
- Create realistic test data for various file types
- Document folder structure and organization rules

### Unit Tests Structure
```typescript
// tests/drive/unit/operations.test.ts
describe('DriveOperations', () => {
  let driveOps: DriveOperations;
  let mockClient: jest.Mocked<drive_v3.Drive>;
  
  beforeEach(() => {
    mockClient = createMockDriveClient();
    driveOps = new DriveOperations(mockClient);
  });
  
  describe('createFolder', () => {
    it('should create folder with correct metadata', async () => {
      // Arrange
      const folderName = '01.領収書';
      const mockResponse = createMockFolderResponse();
      mockClient.files.create.mockResolvedValue(mockResponse);
      
      // Act
      const result = await driveOps.createFolder(folderName);
      
      // Assert
      expect(mockClient.files.create).toHaveBeenCalledWith({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, name, parents, createdTime, modifiedTime'
      });
      expect(result.name).toBe(folderName);
    });
    
    it('should create folder with parent', async () => {
      // Test parent folder creation
    });
  });
  
  describe('uploadFile', () => {
    it('should upload file with correct metadata', async () => {
      // Test file upload
    });
    
    it('should handle duplicate filenames', async () => {
      // Test filename uniqueness
    });
    
    it('should set proper file properties', async () => {
      // Test metadata setting
    });
  });
  
  describe('findFolder', () => {
    it('should find existing folder by name', async () => {
      // Test folder search
    });
    
    it('should return null for non-existent folder', async () => {
      // Test folder not found scenario
    });
  });
});

// tests/drive/unit/organizer.test.ts
describe('ReceiptOrganizer', () => {
  let organizer: ReceiptOrganizer;
  let mockServices: MockServices;
  
  beforeEach(() => {
    mockServices = createMockDriveServices();
    organizer = new ReceiptOrganizer(
      mockServices.fileManager,
      mockServices.folderManager,
      mockServices.receiptService,
      mockServices.logger
    );
  });
  
  describe('organizeReceipt', () => {
    it('should organize receipt to correct monthly folder', async () => {
      // Arrange
      const receipt = createMockReceipt({
        transaction_date: new Date('2025-03-15')
      });
      const structure = createMockFolderStructure();
      
      // Act
      const result = await organizer.organizeReceipt(receipt.id);
      
      // Assert
      expect(result.status).toBe('success');
      expect(result.targetFolder).toBe(structure.monthlyFolders['03']);
    });
    
    it('should organize fixed asset to special folder', async () => {
      // Test fixed asset organization
    });
    
    it('should handle organization failures gracefully', async () => {
      // Test error scenarios
    });
  });
  
  describe('generateFileName', () => {
    it('should generate filename with date prefix', async () => {
      // Test filename generation
    });
    
    it('should sanitize invalid characters', async () => {
      // Test filename sanitization
    });
  });
});

// tests/drive/unit/quota-manager.test.ts
describe('DriveQuotaManager', () => {
  it('should calculate quota usage correctly', async () => {
    // Test quota calculation
  });
  
  it('should detect warning levels', async () => {
    // Test quota warning levels
  });
  
  it('should estimate upload impact', async () => {
    // Test upload impact estimation
  });
});
```

### Integration Tests
```typescript
// tests/drive/integration/drive-api.test.ts
describe('Drive API Integration', () => {
  let testAccount: TestAccount;
  let driveClient: DriveOAuthClient;
  let testFolder: string;
  
  beforeAll(async () => {
    testAccount = await setupTestAccount();
    driveClient = new DriveOAuthClient();
    
    // Create test folder for isolation
    testFolder = await createTestFolder('freee-test-' + Date.now());
  });
  
  afterAll(async () => {
    // Cleanup test folder and files
    await cleanupTestFolder(testFolder);
  });
  
  describe('OAuth Flow', () => {
    it('should complete OAuth authorization successfully', async () => {
      const authUrl = await driveClient.initiateAuth(testAccount.userId);
      expect(authUrl).toContain('accounts.google.com');
      
      // Simulate OAuth callback
      const result = await driveClient.handleCallback(
        testAccount.testCode,
        testAccount.testState
      );
      expect(result.success).toBe(true);
    });
    
    it('should check required scopes', async () => {
      const hasScopes = await driveClient.hasRequiredScopes(testAccount.userId);
      expect(hasScopes).toBe(true);
    });
  });
  
  describe('Folder Operations', () => {
    it('should create folder structure', async () => {
      const client = await driveClient.getDriveClient(testAccount.userId);
      const folderManager = new ReceiptFolderManager(new DriveOperations(client));
      
      const structure = await folderManager.setupReceiptFolders(testAccount.userId);
      
      expect(structure.rootFolderId).toBeDefined();
      expect(Object.keys(structure.monthlyFolders)).toHaveLength(12);
      expect(structure.fixedAssetsFolderId).toBeDefined();
    });
    
    it('should handle folder name conflicts', async () => {
      // Test duplicate folder handling
    });
  });
  
  describe('File Operations', () => {
    it('should upload and organize receipt file', async () => {
      const testFile = createTestPdfBuffer();
      const client = await driveClient.getDriveClient(testAccount.userId);
      const fileManager = new DriveFileManager(new DriveOperations(client));
      
      const result = await fileManager.uploadFile(
        'test-receipt.pdf',
        testFile,
        'application/pdf',
        testFolder,
        { source: 'test' }
      );
      
      expect(result.id).toBeDefined();
      expect(result.name).toBe('test-receipt.pdf');
    });
    
    it('should handle duplicate filenames correctly', async () => {
      // Upload same file twice and verify numbering
    });
  });
  
  describe('Quota Management', () => {
    it('should retrieve quota information', async () => {
      const client = await driveClient.getDriveClient(testAccount.userId);
      const quotaManager = new DriveQuotaManager(new DriveOperations(client), logger);
      
      const quotaInfo = await quotaManager.checkQuotaUsage(testAccount.userId);
      
      expect(quotaInfo.limit).toBeGreaterThan(0);
      expect(quotaInfo.usage).toBeGreaterThanOrEqual(0);
      expect(quotaInfo.usagePercentage).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### End-to-End Tests
```typescript
// tests/drive/e2e/receipt-organization.test.ts
describe('Receipt Organization E2E', () => {
  it('should organize receipt end-to-end', async () => {
    // 1. Create test receipt in database
    const receipt = await createTestReceipt({
      user_id: testAccount.userId,
      transaction_date: new Date('2025-06-15'),
      description: 'Test receipt for organization'
    });
    
    // 2. Trigger organization
    const response = await request(app)
      .post('/api/drive/organize')
      .send({ receiptIds: [receipt.id] })
      .expect(200);
    
    // 3. Verify receipt was organized
    const organized = await db.receipts.findUnique({
      where: { id: receipt.id }
    });
    expect(organized.drive_file_id).toBeDefined();
    expect(organized.organized_at).toBeDefined();
    
    // 4. Verify file exists in correct folder
    const client = await driveClient.getDriveClient(testAccount.userId);
    const driveOps = new DriveOperations(client);
    
    const structure = await getFolderStructure(testAccount.userId);
    const files = await driveOps.listFiles(structure.monthlyFolders['06']);
    
    expect(files.some(f => f.id === organized.drive_file_id)).toBe(true);
  });
  
  it('should handle fixed asset organization', async () => {
    // Test fixed asset specific organization
  });
  
  it('should sync metadata after organization', async () => {
    // Test metadata synchronization
  });
  
  it('should handle batch organization', async () => {
    // Test multiple receipt organization
  });
});
```

### Mock Data and Utilities
```typescript
// tests/drive/mocks/drive-responses.ts
export const mockFolderCreateResponse = {
  data: {
    id: 'folder_123',
    name: '01.領収書',
    parents: ['root'],
    createdTime: '2025-06-04T10:00:00.000Z',
    modifiedTime: '2025-06-04T10:00:00.000Z'
  }
};

export const mockFileUploadResponse = {
  data: {
    id: 'file_123',
    name: 'receipt.pdf',
    size: '12345',
    mimeType: 'application/pdf',
    createdTime: '2025-06-04T10:00:00.000Z',
    webViewLink: 'https://drive.google.com/file/d/file_123/view'
  }
};

export const mockQuotaResponse = {
  data: {
    storageQuota: {
      limit: '16106127360', // 15GB
      usage: '1073741824',  // 1GB
      usageInDrive: '536870912', // 512MB
      usageInDriveTrash: '0'
    },
    user: {
      emailAddress: 'test@example.com'
    }
  }
};

export function createMockDriveClient(): jest.Mocked<drive_v3.Drive> {
  return {
    files: {
      create: jest.fn(),
      list: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    about: {
      get: jest.fn()
    }
  } as any;
}

export function createTestPdfBuffer(): Buffer {
  // Create minimal valid PDF buffer for testing
  return Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF');
}
```

### Documentation Structure
```markdown
# docs/user/drive-setup.md
## Setting Up Google Drive Integration

### Prerequisites
- Google account with Drive access
- Sufficient storage space for receipts

### Initial Setup
1. Connect Google Drive account
2. Authorize required permissions
3. Configure folder structure
4. Set organization preferences

### Using Drive Organization
1. Automatic organization after OCR
2. Manual organization options
3. Folder structure explanation
4. File naming conventions

### Managing Storage
- Monitoring quota usage
- Cleaning up old files
- Upgrading storage plans

# docs/developer/drive-api.md
## Google Drive API Integration

### Architecture Overview
- OAuth 2.0 authentication
- Folder management system
- File organization patterns
- Error handling strategies

### API Reference
- Upload file: `POST /api/drive/upload`
- Organize receipts: `POST /api/drive/organize`
- Sync metadata: `POST /api/drive/sync`
- Check status: `GET /api/drive/status`

### Configuration
- Environment variables
- Folder structure settings
- Quota monitoring

### Best Practices
- File naming conventions
- Error handling patterns
- Performance optimization
```

### Performance Testing
```typescript
// tests/drive/performance/upload-performance.test.ts
describe('Drive Upload Performance', () => {
  it('should handle multiple concurrent uploads', async () => {
    const files = Array.from({ length: 10 }, () => createTestPdfBuffer());
    const startTime = Date.now();
    
    const results = await Promise.allSettled(
      files.map((file, index) => 
        driveFileManager.uploadFile(`test-${index}.pdf`, file, 'application/pdf', testFolder)
      )
    );
    
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    expect(successCount).toBeGreaterThan(8); // Allow for some failures
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });
  
  it('should handle large file uploads efficiently', async () => {
    // Test with larger files
  });
});
```

### Interface Specifications
- **Input Interfaces**: Tests all Drive integration PBIs
- **Output Interfaces**: Provides test utilities for other components
  ```typescript
  export interface DriveTestUtilities {
    createMockDriveClient(): jest.Mocked<drive_v3.Drive>;
    setupTestAccount(): Promise<TestAccount>;
    createTestFolder(name: string): Promise<string>;
    cleanupTestData(): Promise<void>;
    createTestPdfBuffer(): Buffer;
  }
  
  export interface TestAccount {
    userId: string;
    driveClient: drive_v3.Drive;
    testFolder: string;
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
- [ ] Unit test coverage is above 90% for all Drive modules
- [ ] Integration tests pass with real Drive API
- [ ] End-to-end tests cover complete file organization flow
- [ ] Performance tests validate upload and organization speed
- [ ] User documentation covers setup and usage
- [ ] Developer documentation includes all API endpoints

### Verification Commands
```bash
# Run all Drive tests
npm run test:drive
# Check test coverage
npm run test:coverage -- drive
# Run integration tests
npm run test:integration:drive
# Run E2E tests
npm run test:e2e:drive
# Run performance tests
npm run test:performance:drive
```

## Dependencies
- **Required**: PBI-2-3-1 through PBI-2-3-4 - All Drive integration components
- **Required**: Test infrastructure setup

## Testing Requirements
- Unit tests: Test all Drive modules with 90%+ coverage
- Integration tests: Test with real Drive API using test account
- E2E tests: Test complete user workflows
- Performance tests: Validate upload and organization performance

## Estimate
1 story point

## Priority
Medium - Testing and documentation ensure quality but don't block features

## Implementation Notes
- Set up dedicated test Google account for integration testing
- Use Jest for unit testing and Playwright for E2E tests
- Create reusable test utilities for other teams
- Include performance benchmarks in test suite
- Set up automated test runs in CI/CD pipeline
- Document quota considerations for production usage
