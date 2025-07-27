# PBI-2-1-3: Observability Setup

## Description

Implement comprehensive observability infrastructure including structured logging, metrics collection, and distributed
tracing. This enables monitoring, debugging, and performance analysis of AI-generated code and external API
integrations.

## Implementation Details

### Files to Create/Modify

1. `src/lib/observability/logger.ts` - Structured logging configuration
2. `src/lib/observability/metrics.ts` - Metrics collection utilities
3. `src/lib/observability/tracing.ts` - Distributed tracing setup
4. `src/lib/observability/index.ts` - Observability module exports
5. `src/middleware/observability.ts` - Next.js middleware for request tracking
6. `docs/observability/monitoring-guide.md` - Monitoring and alerting guide
7. `docker-compose.observability.yml` - Local observability stack

### Technical Requirements

- Implement structured JSON logging with multiple levels
- Set up OpenTelemetry for distributed tracing
- Configure Prometheus-compatible metrics export
- Add request/response logging middleware
- Include error tracking and performance monitoring

### Logging Configuration

```typescript
interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  provider?: string;
  duration?: number;
  [key: string]: any;
}

interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

// Usage example
logger.info('OAuth token refreshed', {
  userId: user.id,
  provider: 'google',
  operation: 'token_refresh',
  duration: 150,
});
```

### Metrics Configuration

```typescript
interface Metrics {
  // Counters
  incrementOAuthAttempts(provider: string, status: 'success' | 'failure'): void;
  incrementOCRProcessed(status: 'success' | 'failure'): void;
  incrementEmailsProcessed(provider: string): void;

  // Histograms
  recordApiDuration(provider: string, operation: string, duration: number): void;
  recordOCRDuration(duration: number): void;
  recordEmailProcessingDuration(duration: number): void;

  // Gauges
  setActiveUsers(count: number): void;
  setPendingJobs(count: number): void;
}
```

### Tracing Setup

```typescript
// OpenTelemetry configuration
const tracer = trace.getTracer('freee-receipt-automation', '1.0.0');

// Span creation helper
export function createSpan<T>(
  name: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string | number>
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async span => {
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Environment Variables

```bash
# Observability configuration
LOG_LEVEL=info
ENABLE_TRACING=true
METRICS_PORT=9090
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_METRICS_PATH=/metrics

# For production
DATADOG_API_KEY=<your-key>
SENTRY_DSN=<your-dsn>
```

### Code Patterns to Follow

- Use structured logging with consistent field names
- Include correlation IDs for request tracing
- Add telemetry to all external API calls
- Implement graceful degradation if observability fails

### Interface Specifications

- **Input Interfaces**: Integrates with all other PBIs for monitoring
- **Output Interfaces**: Provides observability utilities

  ```typescript
  export interface ObservabilityContext {
    logger: Logger;
    metrics: Metrics;
    createSpan: typeof createSpan;
    requestId: string;
  }

  export interface PerformanceMetrics {
    operation: string;
    duration: number;
    status: 'success' | 'failure' | 'timeout';
    provider?: string;
    errorCode?: string;
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

- [ ] Structured logging is configured with multiple levels
- [ ] OpenTelemetry tracing is set up and working
- [ ] Metrics collection for key operations is implemented
- [ ] Request correlation IDs are generated and tracked
- [ ] Error tracking captures and reports exceptions
- [ ] Performance monitoring covers external API calls

### Verification Commands

```bash
# Test logging output
npm run dev && curl http://localhost:3000/api/health | jq .
# Check metrics endpoint
curl http://localhost:9090/metrics
# Verify tracing (requires Jaeger)
docker-compose -f docker-compose.observability.yml up -d
```

## Dependencies

- **Required**: PBI-1-1-4 - Environment configuration for observability settings

## Testing Requirements

- Unit tests: Test logging, metrics, and tracing utilities
- Integration tests: Verify observability in realistic scenarios
- Test data: Mock telemetry data for testing dashboards

## Estimate

1 story point

## Priority

High - Observability needed for debugging AI-generated code

## Implementation Notes

- Consider using Winston or Pino for structured logging
- Set up Jaeger for local development tracing
- Use Prometheus client for Node.js metrics
- Implement sampling for high-volume traces
- Add health check endpoints for monitoring systems
- Consider using Next.js middleware for automatic request tracking
