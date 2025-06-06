# PBI-2-2-5: Gmail Testing and Documentation

## Description
Create comprehensive testing suite and documentation for Gmail API integration. This includes unit tests, integration tests, end-to-end testing scenarios, and complete user and developer documentation.

## Implementation Details

### Files to Create/Modify
1. `tests/gmail/unit/` - Unit test files for Gmail modules
2. `tests/gmail/integration/` - Integration tests with Gmail API
3. `tests/gmail/e2e/` - End-to-end testing scenarios
4. `tests/gmail/mocks/` - Mock data and Gmail API responses
5. `docs/user/gmail-setup.md` - User setup guide
6. `docs/developer/gmail-api.md` - Developer API documentation
7. `docs/troubleshooting/gmail-issues.md` - Common issues and solutions

### Technical Requirements
- Achieve 90%+ test coverage for Gmail modules
- Test both success and failure scenarios
- Mock Gmail API responses for reliable testing
- Create realistic test data for various email types
- Document setup procedures and troubleshooting

### Unit Tests Structure
```typescript
// tests/gmail/unit/operations.test.ts
describe('GmailOperations', () => {
  let gmailOps: GmailOperations;
  let mockClient: jest.Mocked<gmail_v1.Gmail>;
  
  beforeEach(() => {
    mockClient = createMockGmailClient();
    gmailOps = new GmailOperations(mockClient);
  });
  
  describe('searchEmails', () => {
    it('should search emails with correct query parameters', async () => {
      // Arrange
      const options = { query: 'from:apple.com', maxResults: 10 };
      const mockResponse = createMockSearchResponse();
      mockClient.users.messages.list.mockResolvedValue(mockResponse);
      
      // Act
      const result = await gmailOps.searchEmails(options);
      
      // Assert
      expect(mockClient.users.messages.list).toHaveBeenCalledWith({
        userId: 'me',
        q: 'from:apple.com',
        maxResults: 10
      });
      expect(result.messages).toHaveLength(5);
    });
    
    it('should handle empty search results', async () => {
      // Test empty result scenario
    });
    
    it('should handle pagination correctly', async () => {
      // Test pagination logic
    });
  });
  
  describe('getEmailDetails', () => {
    it('should retrieve and parse email details correctly', async () => {
      // Test email parsing
    });
    
    it('should handle emails without HTML body', async () => {
      // Test text-only emails
    });
  });
  
  describe('getEmailAttachments', () => {
    it('should download and process PDF attachments', async () => {
      // Test PDF attachment handling
    });
    
    it('should handle emails without attachments', async () => {
      // Test no-attachment scenario
    });
    
    it('should skip non-processable attachment types', async () => {
      // Test attachment filtering
    });
  });
});

// tests/gmail/unit/processor.test.ts
describe('GmailProcessor', () => {
  let processor: GmailProcessor;
  let mockServices: MockServices;
  
  beforeEach(() => {
    mockServices = createMockServices();
    processor = new GmailProcessor(
      mockServices.gmailOps,
      mockServices.storage,
      mockServices.ocr,
      mockServices.logger
    );
  });
  
  describe('processReceiptEmails', () => {
    it('should process Apple receipt emails correctly', async () => {
      // Test Apple receipt processing
    });
    
    it('should handle processing failures gracefully', async () => {
      // Test error scenarios
    });
    
    it('should skip non-receipt emails', async () => {
      // Test classification filtering
    });
  });
});
```

### Integration Tests
```typescript
// tests/gmail/integration/gmail-api.test.ts
describe('Gmail API Integration', () => {
  let testAccount: TestAccount;
  let gmailClient: GmailOAuthClient;
  
  beforeAll(async () => {
    // Set up test Gmail account with known test emails
    testAccount = await setupTestAccount();
    gmailClient = new GmailOAuthClient();
  });
  
  describe('OAuth Flow', () => {
    it('should complete OAuth authorization successfully', async () => {
      const authUrl = await gmailClient.initiateAuth(testAccount.userId);
      expect(authUrl).toContain('accounts.google.com');
      
      // Simulate OAuth callback
      const result = await gmailClient.handleCallback(
        testAccount.testCode,
        testAccount.testState
      );
      expect(result.success).toBe(true);
    });
    
    it('should refresh expired tokens automatically', async () => {
      // Test token refresh mechanism
    });
  });
  
  describe('Email Operations', () => {
    it('should search for test receipt emails', async () => {
      const client = await gmailClient.getAuthenticatedClient(testAccount.userId);
      const operations = new GmailOperations(client);
      
      const results = await operations.searchEmails({
        query: 'from:test-receipts@example.com'
      });
      
      expect(results.messages.length).toBeGreaterThan(0);
    });
    
    it('should download test email attachments', async () => {
      // Test attachment download with known test email
    });
  });
  
  describe('Error Handling', () => {
    it('should handle rate limiting correctly', async () => {
      // Simulate rate limiting scenario
    });
    
    it('should retry on transient failures', async () => {
      // Test retry mechanism
    });
  });
});
```

### End-to-End Tests
```typescript
// tests/gmail/e2e/receipt-processing.test.ts
describe('Gmail Receipt Processing E2E', () => {
  it('should process Apple receipt email end-to-end', async () => {
    // 1. Send test email to test account
    await sendTestEmail('apple-receipt-sample.eml');
    
    // 2. Trigger Gmail processing
    const response = await request(app)
      .post('/api/gmail/process')
      .send({ filter: 'apple' })
      .expect(200);
    
    // 3. Verify receipt was created
    const receipts = await db.receipts.findMany({
      where: { source: 'gmail' }
    });
    expect(receipts).toHaveLength(1);
    
    // 4. Verify OCR was triggered
    const ocrJobs = await db.processing_logs.findMany({
      where: { process_type: 'ocr' }
    });
    expect(ocrJobs).toHaveLength(1);
    
    // 5. Verify file was saved to storage
    const fileExists = await storageService.exists(receipts[0].file_path);
    expect(fileExists).toBe(true);
  });
  
  it('should handle HTML email conversion to PDF', async () => {
    // Test HTML email processing
  });
  
  it('should skip already processed emails', async () => {
    // Test duplicate processing prevention
  });
});
```

### Mock Data and Utilities
```typescript
// tests/gmail/mocks/gmail-responses.ts
export const mockEmailSearchResponse = {
  data: {
    messages: [
      { id: 'msg_123', threadId: 'thread_123' },
      { id: 'msg_124', threadId: 'thread_124' }
    ],
    resultSizeEstimate: 2
  }
};

export const mockAppleReceiptEmail = {
  id: 'apple_receipt_123',
  subject: 'Your receipt from Apple',
  from: 'no_reply@email.apple.com',
  date: new Date('2025-06-01'),
  body: {
    html: '<html>...</html>',
    text: 'Receipt details...'
  },
  attachments: [
    {
      filename: 'Receipt.pdf',
      mimeType: 'application/pdf',
      size: 12345,
      data: 'base64-encoded-pdf-data'
    }
  ]
};

export function createMockGmailClient(): jest.Mocked<gmail_v1.Gmail> {
  return {
    users: {
      messages: {
        list: jest.fn(),
        get: jest.fn(),
        attachments: {
          get: jest.fn()
        }
      }
    }
  } as any;
}
```

### Documentation Structure
```markdown
# docs/user/gmail-setup.md
## Setting Up Gmail Integration

### Prerequisites
- Gmail account with API access enabled
- Google Cloud Console project

### Step-by-Step Setup
1. Create Google Cloud Project
2. Enable Gmail API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Configure application settings

### Connecting Your Gmail Account
1. Navigate to Settings > Integrations
2. Click "Connect Gmail"
3. Authorize the application
4. Configure email filters

### Troubleshooting
- Common error messages and solutions
- How to reconnect if authentication fails
- Checking Gmail API quotas

# docs/developer/gmail-api.md
## Gmail API Integration

### Architecture Overview
- OAuth 2.0 authentication flow
- API operation patterns
- Error handling strategies

### API Reference
- Search emails: `GET /api/gmail/search`
- Process emails: `POST /api/gmail/process`
- Get status: `GET /api/gmail/status`

### Configuration
- Environment variables
- Retry policies
- Rate limiting
```

### Interface Specifications
- **Input Interfaces**: Tests all Gmail integration PBIs
- **Output Interfaces**: Provides test utilities for other components
  ```typescript
  export interface TestUtilities {
    createMockGmailClient(): jest.Mocked<gmail_v1.Gmail>;
    setupTestAccount(): Promise<TestAccount>;
    sendTestEmail(template: string): Promise<void>;
    cleanupTestData(): Promise<void>;
  }
  
  export interface TestAccount {
    userId: string;
    emailAddress: string;
    testCode: string;
    testState: string;
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
- [ ] Unit test coverage is above 90% for all Gmail modules
- [ ] Integration tests pass with real Gmail API
- [ ] End-to-end tests cover complete receipt processing flow
- [ ] User documentation is complete and tested
- [ ] Developer documentation includes all API endpoints
- [ ] Troubleshooting guide covers common issues

### Verification Commands
```bash
# Run all Gmail tests
npm run test:gmail
# Check test coverage
npm run test:coverage -- gmail
# Run integration tests
npm run test:integration:gmail
# Run E2E tests
npm run test:e2e:gmail
# Build documentation
npm run docs:build
```

## Dependencies
- **Required**: PBI-2-2-1 through PBI-2-2-4 - All Gmail integration components
- **Required**: Test infrastructure setup

## Testing Requirements
- Unit tests: Test all Gmail modules with 90%+ coverage
- Integration tests: Test with real Gmail API using test account
- E2E tests: Test complete user workflows
- Test data: Variety of email formats and attachment types

## Estimate
1 story point

## Priority
Medium - Testing and documentation ensure quality but don't block features

## Implementation Notes
- Set up dedicated test Gmail account for integration testing
- Use Jest for unit testing and Playwright for E2E tests
- Create reusable test utilities for other teams
- Include performance benchmarks in test suite
- Set up automated test runs in CI/CD pipeline
- Use Storybook for component documentation if applicable
