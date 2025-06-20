# API Error Handling Guidelines

This document outlines the comprehensive error handling strategy for Gmail and Google Drive API integration.

## Error Response Format

All API errors follow a standardized JSON format for consistency and ease of debugging.

### Standard Error Schema

```json
{
  "error": "error_code",
  "message": "Human-readable error description",
  "details": {
    "field": "field_name",
    "code": "validation_code",
    "retryAfter": 60
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

### Error Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `error` | string | ✅ | Machine-readable error code |
| `message` | string | ✅ | Human-readable error description |
| `details` | object | ❌ | Additional error-specific information |
| `timestamp` | string | ✅ | ISO 8601 error timestamp |
| `path` | string | ✅ | API endpoint that generated the error |
| `requestId` | string | ✅ | Unique identifier for request tracing |

## HTTP Status Codes

### 4xx Client Errors

#### 400 Bad Request
Invalid request parameters or malformed request body.

**Common Scenarios**:
- Missing required parameters
- Invalid parameter values
- Malformed JSON body
- Invalid date formats

**Example Response**:
```json
{
  "error": "INVALID_PARAMETER",
  "message": "The 'maxResults' parameter must be between 1 and 500",
  "details": {
    "field": "maxResults",
    "code": "OUT_OF_RANGE",
    "provided": 1000,
    "min": 1,
    "max": 500
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

#### 401 Unauthorized
Authentication required or invalid credentials.

**Common Scenarios**:
- Missing access token
- Expired access token
- Invalid access token
- Insufficient token scope

**Example Response**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Access token is expired",
  "details": {
    "code": "TOKEN_EXPIRED",
    "expiredAt": "2024-06-20T11:30:00.000Z"
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

#### 403 Forbidden
Valid authentication but insufficient permissions.

**Common Scenarios**:
- Missing required OAuth scopes
- API access disabled
- Resource access denied
- Quota exceeded

**Example Response**:
```json
{
  "error": "INSUFFICIENT_SCOPE",
  "message": "Token lacks required scope for this operation",
  "details": {
    "code": "SCOPE_MISSING",
    "required": ["https://www.googleapis.com/auth/gmail.readonly"],
    "provided": ["https://www.googleapis.com/auth/userinfo.email"]
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

#### 404 Not Found
Requested resource does not exist.

**Common Scenarios**:
- Invalid message ID
- Deleted file
- Non-existent attachment
- Invalid endpoint

**Example Response**:
```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Gmail message not found",
  "details": {
    "code": "MESSAGE_NOT_FOUND",
    "messageId": "abc123def456"
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages/abc123def456",
  "requestId": "req_123456789"
}
```

#### 413 Payload Too Large
Request payload exceeds size limits.

**Common Scenarios**:
- File upload too large
- Request body too large
- Attachment size exceeded

**Example Response**:
```json
{
  "error": "PAYLOAD_TOO_LARGE",
  "message": "File size exceeds maximum allowed limit",
  "details": {
    "code": "FILE_TOO_LARGE",
    "size": 52428800,
    "maxSize": 26214400
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/drive/files",
  "requestId": "req_123456789"
}
```

#### 429 Too Many Requests
Rate limit exceeded.

**Common Scenarios**:
- API quota exceeded
- Too many requests per second
- User-specific rate limit hit

**Example Response**:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "API rate limit exceeded",
  "details": {
    "code": "QUOTA_EXCEEDED",
    "retryAfter": 60,
    "quotaUser": "user123",
    "limit": "250 requests per 100 seconds"
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

### 5xx Server Errors

#### 500 Internal Server Error
Unexpected server-side error.

**Common Scenarios**:
- Unhandled exceptions
- Database connection failures
- External service unavailable
- Configuration errors

**Example Response**:
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "details": {
    "code": "UNEXPECTED_ERROR"
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

#### 502 Bad Gateway
External service error (Google APIs).

**Example Response**:
```json
{
  "error": "UPSTREAM_SERVICE_ERROR",
  "message": "Gmail API is temporarily unavailable",
  "details": {
    "code": "GMAIL_API_DOWN",
    "service": "Gmail API",
    "retryAfter": 30
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

#### 503 Service Unavailable
Service temporarily unavailable.

**Example Response**:
```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Service is temporarily unavailable for maintenance",
  "details": {
    "code": "MAINTENANCE_MODE",
    "retryAfter": 300
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

## Error Code Categories

### Authentication Errors (AUTH_*)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication is required |
| `AUTH_INVALID` | 401 | Invalid authentication credentials |
| `AUTH_EXPIRED` | 401 | Authentication token has expired |
| `AUTH_INSUFFICIENT_SCOPE` | 403 | Token lacks required permissions |

### Validation Errors (VALIDATION_*)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_FAILED` | 400 | Request validation failed |
| `VALIDATION_MISSING_FIELD` | 400 | Required field is missing |
| `VALIDATION_INVALID_FORMAT` | 400 | Field format is invalid |
| `VALIDATION_OUT_OF_RANGE` | 400 | Value is outside allowed range |

### Resource Errors (RESOURCE_*)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `RESOURCE_CONFLICT` | 409 | Resource state conflict |
| `RESOURCE_LOCKED` | 423 | Resource is temporarily locked |

### Rate Limiting Errors (RATE_*)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `RATE_QUOTA_EXCEEDED` | 429 | Daily quota exceeded |
| `RATE_CONCURRENT_LIMIT` | 429 | Concurrent request limit exceeded |

### External Service Errors (EXTERNAL_*)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `EXTERNAL_SERVICE_ERROR` | 502 | External service error |
| `EXTERNAL_SERVICE_TIMEOUT` | 504 | External service timeout |
| `EXTERNAL_SERVICE_UNAVAILABLE` | 503 | External service unavailable |

## Gmail API Specific Errors

### Common Gmail Error Scenarios

#### Message Not Found
```json
{
  "error": "GMAIL_MESSAGE_NOT_FOUND",
  "message": "The requested Gmail message could not be found",
  "details": {
    "messageId": "abc123",
    "possibleCauses": [
      "Message was deleted",
      "Message is in trash",
      "Insufficient permissions"
    ]
  }
}
```

#### Attachment Download Failed
```json
{
  "error": "GMAIL_ATTACHMENT_ERROR",
  "message": "Failed to download message attachment",
  "details": {
    "messageId": "abc123",
    "attachmentId": "def456",
    "reason": "Attachment size exceeds limit"
  }
}
```

#### Search Query Invalid
```json
{
  "error": "GMAIL_INVALID_QUERY",
  "message": "Gmail search query is invalid",
  "details": {
    "query": "invalid:syntax",
    "suggestion": "Use 'has:attachment' for messages with attachments"
  }
}
```

## Google Drive API Specific Errors

### Common Drive Error Scenarios

#### File Upload Failed
```json
{
  "error": "DRIVE_UPLOAD_FAILED",
  "message": "Failed to upload file to Google Drive",
  "details": {
    "fileName": "receipt.pdf",
    "reason": "File type not supported",
    "supportedTypes": ["image/jpeg", "image/png", "application/pdf"]
  }
}
```

#### Permission Denied
```json
{
  "error": "DRIVE_PERMISSION_DENIED",
  "message": "Insufficient permissions to access Drive file",
  "details": {
    "fileId": "xyz789",
    "requiredPermission": "write",
    "currentPermission": "read"
  }
}
```

#### Storage Quota Exceeded
```json
{
  "error": "DRIVE_STORAGE_QUOTA_EXCEEDED",
  "message": "Google Drive storage quota exceeded",
  "details": {
    "usedStorage": "14.5 GB",
    "totalStorage": "15 GB",
    "fileSize": "2.3 MB"
  }
}
```

## Client-Side Error Handling

### Retry Strategy

Implement exponential backoff for retryable errors:

```typescript
const RETRYABLE_ERRORS = [
  'RATE_LIMIT_EXCEEDED',
  'EXTERNAL_SERVICE_TIMEOUT',
  'EXTERNAL_SERVICE_UNAVAILABLE'
];

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### Error Recovery Patterns

#### Token Refresh on 401
```typescript
async function apiCall(endpoint: string, options: RequestInit) {
  try {
    return await fetch(endpoint, options);
  } catch (error) {
    if (error.status === 401 && error.error === 'AUTH_EXPIRED') {
      await refreshToken();
      return fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        }
      });
    }
    throw error;
  }
}
```

#### Graceful Degradation
```typescript
async function getMessages() {
  try {
    return await gmailApi.getMessages();
  } catch (error) {
    if (error.error === 'EXTERNAL_SERVICE_UNAVAILABLE') {
      // Fallback to cached data
      return getCachedMessages();
    }
    throw error;
  }
}
```

## Error Monitoring & Alerting

### Key Metrics to Monitor

1. **Error Rate by Status Code**
   - 4xx vs 5xx error ratios
   - Specific error code frequencies
   - Error rate trends over time

2. **Authentication Errors**
   - Token expiration frequency
   - OAuth flow failures
   - Scope insufficient errors

3. **Rate Limiting**
   - Quota utilization
   - Rate limit hit frequency
   - Recovery time patterns

4. **External Service Errors**
   - Gmail/Drive API availability
   - Response time degradation
   - Timeout frequencies

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 5% | > 10% |
| Auth Failures | > 10/hour | > 50/hour |
| Rate Limits | > 80% quota | > 95% quota |
| Service Timeouts | > 2% | > 5% |

### Log Structure

```typescript
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  error: {
    code: string;
    message: string;
    stack?: string;
  };
  request: {
    id: string;
    method: string;
    path: string;
    userAgent: string;
  };
  user: {
    id: string;
    email?: string;
  };
  context: {
    service: 'gmail' | 'drive' | 'oauth';
    operation: string;
    duration: number;
  };
}
```

## Testing Error Scenarios

### Unit Tests

```typescript
describe('Error Handling', () => {
  it('should handle token expiration', async () => {
    const mockResponse = {
      status: 401,
      json: () => ({
        error: 'AUTH_EXPIRED',
        message: 'Access token is expired'
      })
    };
    
    fetch.mockResolvedValueOnce(mockResponse);
    
    await expect(gmailApi.getMessages()).rejects.toThrow('AUTH_EXPIRED');
  });
  
  it('should retry on rate limit', async () => {
    const rateLimitResponse = {
      status: 429,
      json: () => ({
        error: 'RATE_LIMIT_EXCEEDED',
        details: { retryAfter: 1 }
      })
    };
    
    fetch
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce({ status: 200, json: () => ({}) });
    
    const result = await withRetry(() => gmailApi.getMessages());
    expect(result).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Tests

```typescript
describe('Gmail API Error Integration', () => {
  it('should handle invalid message ID gracefully', async () => {
    const response = await request(app)
      .get('/api/gmail/messages/invalid_id')
      .expect(404);
    
    expect(response.body).toMatchObject({
      error: 'GMAIL_MESSAGE_NOT_FOUND',
      message: expect.any(String),
      timestamp: expect.any(String),
      requestId: expect.any(String)
    });
  });
});
```

## Best Practices

### 1. Consistent Error Format
- Use standardized error schema across all endpoints
- Include request ID for tracing
- Provide actionable error messages

### 2. Appropriate HTTP Status Codes
- Use correct status codes for different error types
- Don't return 200 for error responses
- Include retry guidance in headers

### 3. Security Considerations
- Don't expose sensitive information in error messages
- Log security-related errors separately
- Rate limit error endpoints to prevent abuse

### 4. User Experience
- Provide clear, non-technical error messages for users
- Include suggested actions where possible
- Implement progressive error disclosure

### 5. Observability
- Include correlation IDs across service boundaries
- Log errors with sufficient context for debugging
- Monitor error patterns for system health insights