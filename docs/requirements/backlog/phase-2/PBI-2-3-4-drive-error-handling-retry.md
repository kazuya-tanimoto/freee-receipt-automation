# PBI-2-3-4: Google Drive Error Handling and Retry Logic

## Description
Implement comprehensive error handling and retry mechanisms for Google Drive API operations. This ensures robust operation under various failure conditions including API rate limits, storage quota issues, network problems, and temporary service unavailability.

## Implementation Details

### Files to Create/Modify
1. `src/lib/drive/error-handler.ts` - Drive-specific error handling
2. `src/lib/drive/retry-strategy.ts` - Retry logic implementation
3. `src/lib/drive/circuit-breaker.ts` - Circuit breaker for Drive API
4. `src/lib/drive/quota-manager.ts` - Drive quota monitoring and management
5. `src/lib/common/drive-errors.ts` - Drive error classification
6. `docs/drive/error-handling.md` - Error handling documentation

### Technical Requirements
- Handle Drive API rate limiting and quotas
- Implement exponential backoff for transient failures
- Monitor storage quota usage and warnings
- Classify errors as retryable vs. non-retryable
- Provide detailed error reporting and recovery suggestions

### Drive-Specific Error Classification
```typescript
export enum DriveErrorType {
  // Retryable errors
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  STORAGE_FULL = 'STORAGE_FULL',
  
  // Non-retryable errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  FOLDER_NOT_FOUND = 'FOLDER_NOT_FOUND',
  CORRUPTED_FILE = 'CORRUPTED_FILE'
}

export class DriveErrorHandler {
  constructor(private logger: Logger) {}
  
  classifyError(error: any): { type: DriveErrorType; retryable: boolean; delay?: number; suggestion?: string } {
    // Drive API specific errors
    if (error.code === 403) {
      // Check specific 403 error types
      if (error.message?.includes('rateLimitExceeded')) {
        return {
          type: DriveErrorType.RATE_LIMIT,
          retryable: true,
          delay: this.calculateRateLimitDelay(error),
          suggestion: 'Reduce API call frequency'
        };
      }
      
      if (error.message?.includes('storageQuotaExceeded')) {
        return {
          type: DriveErrorType.STORAGE_FULL,
          retryable: false,
          suggestion: 'Free up storage space or upgrade Google Drive plan'
        };
      }
      
      if (error.message?.includes('quotaExceeded')) {
        return {
          type: DriveErrorType.QUOTA_EXCEEDED,
          retryable: true,
          delay: 86400000, // 24 hours for daily quota
          suggestion: 'Wait for quota reset or request quota increase'
        };
      }
      
      return {
        type: DriveErrorType.PERMISSION_DENIED,
        retryable: false,
        suggestion: 'Check OAuth scopes and file permissions'
      };
    }
    
    if (error.code === 401) {
      return {
        type: DriveErrorType.AUTHENTICATION_ERROR,
        retryable: false,
        suggestion: 'Re-authenticate with Google Drive'
      };
    }
    
    if (error.code === 404) {
      if (error.message?.includes('File not found')) {
        return {
          type: DriveErrorType.FILE_NOT_FOUND,
          retryable: false,
          suggestion: 'File may have been deleted or moved'
        };
      }
      
      return {
        type: DriveErrorType.FOLDER_NOT_FOUND,
        retryable: false,
        suggestion: 'Folder structure may need to be recreated'
      };
    }
    
    if (error.code >= 500) {
      return {
        type: DriveErrorType.SERVICE_UNAVAILABLE,
        retryable: true,
        delay: 5000,
        suggestion: 'Google Drive service temporary unavailable'
      };
    }
    
    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
      return {
        type: DriveErrorType.NETWORK_ERROR,
        retryable: true,
        delay: 3000,
        suggestion: 'Check network connectivity'
      };
    }
    
    // File corruption during upload
    if (error.message?.includes('corrupt') || error.message?.includes('invalid file')) {
      return {
        type: DriveErrorType.CORRUPTED_FILE,
        retryable: false,
        suggestion: 'File may be corrupted, try re-processing from source'
      };
    }
    
    return {
      type: DriveErrorType.INVALID_REQUEST,
      retryable: false,
      suggestion: 'Check request parameters and file format'
    };
  }
  
  private calculateRateLimitDelay(error: any): number {
    // Check for Retry-After header
    const retryAfter = error.response?.headers['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter) * 1000;
    }
    
    // Different delays based on rate limit type
    if (error.message?.includes('userRateLimitExceeded')) {
      return 120000; // 2 minutes for user rate limits
    }
    
    return 60000; // 1 minute default
  }
}
```

### Drive Quota Manager
```typescript
export class DriveQuotaManager {
  constructor(
    private driveOps: DriveOperations,
    private logger: Logger
  ) {}
  
  async checkQuotaUsage(userId: string): Promise<QuotaInfo> {
    try {
      const about = await this.driveOps.client.about.get({
        fields: 'storageQuota,user'
      });
      
      const quota = about.data.storageQuota;
      if (!quota) {
        throw new Error('Unable to retrieve quota information');
      }
      
      const usage = {
        limit: parseInt(quota.limit || '0'),
        usage: parseInt(quota.usage || '0'),
        usageInDrive: parseInt(quota.usageInDrive || '0'),
        usageInDriveTrash: parseInt(quota.usageInDriveTrash || '0')
      };
      
      const usagePercentage = (usage.usage / usage.limit) * 100;
      
      // Log quota warnings
      if (usagePercentage > 90) {
        this.logger.warn('Drive storage quota nearly full', {
          userId,
          usagePercentage,
          remainingGB: (usage.limit - usage.usage) / (1024 * 1024 * 1024)
        });
      }
      
      return {
        ...usage,
        usagePercentage,
        warningLevel: this.getWarningLevel(usagePercentage)
      };
    } catch (error) {
      this.logger.error('Failed to check Drive quota', error, { userId });
      throw error;
    }
  }
  
  async estimateFileUploadImpact(fileSize: number, quotaInfo: QuotaInfo): Promise<UploadImpact> {
    const newUsage = quotaInfo.usage + fileSize;
    const newPercentage = (newUsage / quotaInfo.limit) * 100;
    
    return {
      canUpload: newUsage <= quotaInfo.limit,
      newUsagePercentage: newPercentage,
      remainingSpace: quotaInfo.limit - newUsage,
      wouldExceedQuota: newUsage > quotaInfo.limit
    };
  }
  
  private getWarningLevel(usagePercentage: number): 'safe' | 'warning' | 'critical' {
    if (usagePercentage >= 95) return 'critical';
    if (usagePercentage >= 85) return 'warning';
    return 'safe';
  }
}
```

### Drive Circuit Breaker
```typescript
export class DriveCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private quotaExceeded = false;
  
  constructor(
    private failureThreshold: number = 5,
    private timeoutMs: number = 300000, // 5 minutes
    private quotaTimeoutMs: number = 86400000, // 24 hours
    private logger: Logger
  ) {}
  
  async execute<T>(operation: () => Promise<T>, operationType: string): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.logger.info('Drive circuit breaker transitioning to HALF_OPEN', {
          operationType
        });
      } else {
        const reason = this.quotaExceeded ? 'quota exceeded' : 'failure threshold reached';
        throw new DriveCircuitBreakerOpenError(
          `Drive API circuit breaker is OPEN (${reason})`
        );
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error, operationType);
      throw error;
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    
    const timeoutMs = this.quotaExceeded ? this.quotaTimeoutMs : this.timeoutMs;
    return (Date.now() - this.lastFailureTime.getTime()) > timeoutMs;
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.quotaExceeded = false;
    this.state = 'CLOSED';
    this.logger.info('Drive circuit breaker reset to CLOSED');
  }
  
  private onFailure(error: any, operationType: string): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    // Special handling for quota exceeded
    if (error.message?.includes('quotaExceeded') || 
        error.message?.includes('storageQuotaExceeded')) {
      this.quotaExceeded = true;
      this.state = 'OPEN';
      this.logger.error('Drive circuit breaker opened due to quota exceeded', {
        operationType,
        error: error.message
      });
      return;
    }
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.logger.error('Drive circuit breaker opened due to failures', {
        failureCount: this.failureCount,
        threshold: this.failureThreshold,
        operationType
      });
    }
  }
}
```

### Robust Drive Operations Wrapper
```typescript
export class RobustDriveOperations extends DriveOperations {
  constructor(
    client: drive_v3.Drive,
    private retryStrategy: RetryStrategy,
    private circuitBreaker: DriveCircuitBreaker,
    private quotaManager: DriveQuotaManager
  ) {
    super(client);
  }
  
  async uploadFile(
    fileName: string,
    fileData: Buffer,
    mimeType: string,
    folderId: string,
    metadata: FileMetadata = {}
  ): Promise<DriveFile> {
    // Check quota before upload
    const quotaInfo = await this.quotaManager.checkQuotaUsage(metadata.userId || 'unknown');
    const uploadImpact = await this.quotaManager.estimateFileUploadImpact(
      fileData.length, 
      quotaInfo
    );
    
    if (!uploadImpact.canUpload) {
      throw new DriveQuotaExceededError(
        'Insufficient storage space',
        quotaInfo,
        uploadImpact
      );
    }
    
    return this.circuitBreaker.execute(
      () => this.retryStrategy.executeWithRetry(
        () => super.uploadFile(fileName, fileData, mimeType, folderId, metadata),
        'drive.uploadFile'
      ),
      'upload'
    );
  }
  
  async createFolder(name: string, parentId?: string): Promise<DriveFolder> {
    return this.circuitBreaker.execute(
      () => this.retryStrategy.executeWithRetry(
        () => super.createFolder(name, parentId),
        'drive.createFolder'
      ),
      'folder_create'
    );
  }
  
  async listFiles(folderId: string, nameFilter?: string): Promise<DriveFile[]> {
    return this.circuitBreaker.execute(
      () => this.retryStrategy.executeWithRetry(
        () => super.listFiles(folderId, nameFilter),
        'drive.listFiles'
      ),
      'list'
    );
  }
}
```

### Error Recovery Strategies
```typescript
export class DriveErrorRecovery {
  constructor(
    private driveOps: RobustDriveOperations,
    private folderManager: ReceiptFolderManager
  ) {}
  
  async recoverFromFolderNotFound(userId: string, operation: string): Promise<void> {
    this.logger.info('Attempting folder recovery', { userId, operation });
    
    try {
      // Recreate folder structure
      await this.folderManager.setupReceiptFolders(userId);
      this.logger.info('Folder structure recreated successfully', { userId });
    } catch (error) {
      this.logger.error('Failed to recover folder structure', error, { userId });
      throw new DriveRecoveryError('Unable to recreate folder structure', error);
    }
  }
  
  async recoverFromPermissionDenied(userId: string): Promise<void> {
    // Log permission issue for manual intervention
    this.logger.error('Drive permission denied - manual intervention required', {
      userId,
      suggestion: 'User needs to re-authorize or check OAuth scopes'
    });
    
    // Could trigger notification to user
    throw new DrivePermissionError(
      'Drive access denied. Please reconnect your Google Drive account.'
    );
  }
}
```

### Interface Specifications
- **Input Interfaces**: Wraps Drive operations from PBI-2-3-2
- **Output Interfaces**: Provides robust Drive operations
  ```typescript
  export interface QuotaInfo {
    limit: number;
    usage: number;
    usageInDrive: number;
    usageInDriveTrash: number;
    usagePercentage: number;
    warningLevel: 'safe' | 'warning' | 'critical';
  }
  
  export interface UploadImpact {
    canUpload: boolean;
    newUsagePercentage: number;
    remainingSpace: number;
    wouldExceedQuota: boolean;
  }
  
  export class DriveQuotaExceededError extends Error {
    constructor(
      message: string,
      public quotaInfo: QuotaInfo,
      public uploadImpact: UploadImpact
    ) {
      super(message);
      this.name = 'DriveQuotaExceededError';
    }
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
- [ ] Drive rate limiting is handled with appropriate delays
- [ ] Storage quota is monitored and validated before uploads
- [ ] Transient failures are retried with exponential backoff
- [ ] Non-retryable errors fail immediately with helpful suggestions
- [ ] Circuit breaker opens after sustained failures or quota issues
- [ ] All error scenarios are logged with context and recovery suggestions

### Verification Commands
```bash
# Test Drive error handling
npm run test:drive -- --grep "error handling"
# Test quota management
npm run test:quota-management
# Simulate rate limiting
npm run test:drive-rate-limit
```

## Dependencies
- **Required**: PBI-2-3-2 - Drive basic operations to wrap
- **Required**: PBI-2-1-3 - Observability for error logging

## Testing Requirements
- Unit tests: Test error classification and retry logic
- Integration tests: Test error handling with mock failures
- Test data: Various Drive API error responses

## Estimate
1 story point

## Priority
High - Robust error handling critical for production reliability

## Implementation Notes
- Monitor Drive API quotas and adjust retry strategies accordingly
- Implement proper error aggregation for monitoring dashboards
- Add metrics for quota usage and error rates
- Consider implementing file cleanup for failed uploads
- Test error handling scenarios in staging environment
- Document troubleshooting steps for common Drive issues
