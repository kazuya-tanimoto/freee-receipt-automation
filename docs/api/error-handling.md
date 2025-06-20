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

| Property    | Type   | Required | Description                           |
| ----------- | ------ | -------- | ------------------------------------- |
| `error`     | string | ✅       | Machine-readable error code           |
| `message`   | string | ✅       | Human-readable error description      |
| `details`   | object | ❌       | Additional error-specific information |
| `timestamp` | string | ✅       | ISO 8601 error timestamp              |
| `path`      | string | ✅       | API endpoint that generated the error |
| `requestId` | string | ✅       | Unique identifier for request tracing |

## HTTP Status Codes

### 4xx Client Errors

#### 400 Bad Request

Invalid request parameters or malformed request body.

**Common Scenarios**:

- Missing required parameters
- Invalid parameter values
- Malformed JSON body
- Invalid date formats

#### 401 Unauthorized

Authentication required or invalid credentials.

**Common Scenarios**:

- Missing access token
- Expired access token
- Invalid access token
- Insufficient token scope

#### 403 Forbidden

Valid authentication but insufficient permissions.

**Common Scenarios**:

- Missing required OAuth scopes
- API access disabled
- Resource access denied
- Quota exceeded

#### 404 Not Found

Requested resource does not exist.

**Common Scenarios**:

- Invalid message ID
- Deleted file
- Non-existent attachment
- Invalid endpoint

#### 429 Too Many Requests

Rate limit exceeded.

**Common Scenarios**:

- API quota exceeded
- Too many requests per second
- User-specific rate limit hit

### 5xx Server Errors

#### 500 Internal Server Error

Unexpected server-side error.

#### 502 Bad Gateway

External service error (Google APIs).

#### 503 Service Unavailable

Service temporarily unavailable.

## Error Code Categories

### Authentication Errors (AUTH\_\*)

| Code                      | HTTP Status | Description                        |
| ------------------------- | ----------- | ---------------------------------- |
| `AUTH_REQUIRED`           | 401         | Authentication is required         |
| `AUTH_INVALID`            | 401         | Invalid authentication credentials |
| `AUTH_EXPIRED`            | 401         | Authentication token has expired   |
| `AUTH_INSUFFICIENT_SCOPE` | 403         | Token lacks required permissions   |

### Validation Errors (VALIDATION\_\*)

| Code                        | HTTP Status | Description                    |
| --------------------------- | ----------- | ------------------------------ |
| `VALIDATION_FAILED`         | 400         | Request validation failed      |
| `VALIDATION_MISSING_FIELD`  | 400         | Required field is missing      |
| `VALIDATION_INVALID_FORMAT` | 400         | Field format is invalid        |
| `VALIDATION_OUT_OF_RANGE`   | 400         | Value is outside allowed range |

### Resource Errors (RESOURCE\_\*)

| Code                 | HTTP Status | Description                    |
| -------------------- | ----------- | ------------------------------ |
| `RESOURCE_NOT_FOUND` | 404         | Requested resource not found   |
| `RESOURCE_CONFLICT`  | 409         | Resource state conflict        |
| `RESOURCE_LOCKED`    | 423         | Resource is temporarily locked |

### Rate Limiting Errors (RATE\_\*)

| Code                    | HTTP Status | Description                       |
| ----------------------- | ----------- | --------------------------------- |
| `RATE_LIMIT_EXCEEDED`   | 429         | Rate limit exceeded               |
| `RATE_QUOTA_EXCEEDED`   | 429         | Daily quota exceeded              |
| `RATE_CONCURRENT_LIMIT` | 429         | Concurrent request limit exceeded |

### External Service Errors (EXTERNAL\_\*)

| Code                           | HTTP Status | Description                  |
| ------------------------------ | ----------- | ---------------------------- |
| `EXTERNAL_SERVICE_ERROR`       | 502         | External service error       |
| `EXTERNAL_SERVICE_TIMEOUT`     | 504         | External service timeout     |
| `EXTERNAL_SERVICE_UNAVAILABLE` | 503         | External service unavailable |

## Client-Side Error Handling

### Retry Strategy

Implement exponential backoff for retryable errors:

```typescript
const RETRYABLE_ERRORS = ['RATE_LIMIT_EXCEEDED', 'EXTERNAL_SERVICE_TIMEOUT', 'EXTERNAL_SERVICE_UNAVAILABLE'];

async function withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
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
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }
    throw error;
  }
}
```

## Error Monitoring & Alerting

### Key Metrics to Monitor

1. **Error Rate by Status Code** - 4xx vs 5xx error ratios
2. **Authentication Errors** - Token expiration frequency
3. **Rate Limiting** - Quota utilization
4. **External Service Errors** - Gmail/Drive API availability

### Alerting Thresholds

| Metric           | Warning     | Critical    |
| ---------------- | ----------- | ----------- |
| Error Rate       | > 5%        | > 10%       |
| Auth Failures    | > 10/hour   | > 50/hour   |
| Rate Limits      | > 80% quota | > 95% quota |
| Service Timeouts | > 2%        | > 5%        |

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

## Related Documentation

- [Error Handling Examples](./error-handling-examples.md) - Detailed examples and test cases
- [OAuth Flows](./oauth-flows.md) - Authentication error scenarios
