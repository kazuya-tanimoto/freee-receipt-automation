# PBI-2-5-2: Background Job Queue Implementation Code

This implementation is split into multiple files due to size constraints:

## Implementation Files

1. [PBI-2-5-2-database-schema.md](PBI-2-5-2-database-schema.md) - Database schema and SQL migrations
2. [PBI-2-5-2-queue-implementation.md](PBI-2-5-2-queue-implementation.md) - Core queue implementation
3. [PBI-2-5-2-job-processor.md](PBI-2-5-2-job-processor.md) - Job processor and worker implementation
4. [PBI-2-5-2-retry-policy.md](PBI-2-5-2-retry-policy.md) - Retry policy and interface specifications

## Overview

This implementation provides a robust background job queue system for processing receipts asynchronously.
The system includes:

- Database-backed job queue with priority support
- Retry mechanism with exponential backoff
- Support for different job types (email, OCR, matching, etc.)
- Concurrent job processing with configurable workers
- Dead letter queue for failed jobs
- Resource usage monitoring and throttling

## Key Components

### Job Types

- `PROCESS_EMAIL_RECEIPT` - Process email receipts
- `PROCESS_OCR` - OCR processing for documents
- `MATCH_TRANSACTION` - Match transactions with receipts
- `ORGANIZE_FILE` - Organize files in Drive
- `SYNC_FREEE` - Sync with freee API
- `GENERATE_REPORT` - Generate reports

### Job Status

- `PENDING` - Job is waiting to be processed
- `PROCESSING` - Job is currently being processed
- `COMPLETED` - Job completed successfully
- `FAILED` - Job failed but may retry
- `CANCELLED` - Job was cancelled
- `DEAD_LETTER` - Job failed permanently

## Usage Example

```typescript
// Initialize job queue
const queue = new JobQueue(supabaseClient, logger);

// Enqueue a single job
const jobId = await queue.enqueue(
  JobType.PROCESS_EMAIL_RECEIPT,
  { email_id: "123", user_id: "456" },
  { priority: 1 }
);

// Start job processor
const processor = new JobProcessor(queue, handlers, logger, {
  maxWorkers: 4,
  pollInterval: 5000,
  jobTypes: [JobType.PROCESS_EMAIL_RECEIPT]
});

await processor.start();
```
