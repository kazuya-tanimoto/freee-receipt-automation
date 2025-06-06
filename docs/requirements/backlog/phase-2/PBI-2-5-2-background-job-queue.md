# PBI-2-5-2: Background Job Queue Implementation

## Description
Implement a robust background job queue system for processing receipts asynchronously. This includes creating a queue management system with retry logic, priority handling, and resource optimization to handle various processing tasks efficiently.

## Implementation Details

### Files to Create/Modify
1. `src/lib/queue/types.ts` - Queue and job type definitions
2. `src/lib/queue/job-queue.ts` - Core queue implementation
3. `src/lib/queue/job-processor.ts` - Job processing logic
4. `src/lib/queue/retry-policy.ts` - Retry strategy implementation
5. `src/lib/queue/job-handlers/` - Individual job handlers
6. `supabase/migrations/009_create_job_queue_tables.sql` - Queue tables
7. `src/lib/queue/queue-monitor.ts` - Queue monitoring utilities

### Technical Requirements
- Implement database-backed job queue with priority support
- Create retry mechanism with exponential backoff
- Support for different job types (email, OCR, matching, etc.)
- Concurrent job processing with configurable workers
- Dead letter queue for failed jobs
- Resource usage monitoring and throttling

### Database Schema
```sql
-- Create job queue table
CREATE TABLE job_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'dead_letter'))
);

-- Create indexes for efficient queries
CREATE INDEX idx_job_queue_status_priority ON job_queue(status, priority DESC, scheduled_at);
CREATE INDEX idx_job_queue_type_status ON job_queue(job_type, status);
CREATE INDEX idx_job_queue_scheduled_at ON job_queue(scheduled_at) WHERE status = 'pending';

-- Create dead letter queue
CREATE TABLE job_dead_letter_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_job_id UUID REFERENCES job_queue(id),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_history JSONB[] NOT NULL,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  resolution_status TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ
);

-- Job processing locks table
CREATE TABLE job_processing_locks (
  job_id UUID PRIMARY KEY REFERENCES job_queue(id),
  worker_id TEXT NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create function to acquire job lock
CREATE OR REPLACE FUNCTION acquire_job_lock(
  p_worker_id TEXT,
  p_job_types TEXT[],
  p_lock_duration INTERVAL DEFAULT '5 minutes'
)
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  priority INTEGER,
  payload JSONB
) AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- Find next available job
  SELECT j.* INTO v_job
  FROM job_queue j
  WHERE j.status = 'pending'
    AND j.scheduled_at <= NOW()
    AND j.job_type = ANY(p_job_types)
    AND NOT EXISTS (
      SELECT 1 FROM job_processing_locks l
      WHERE l.job_id = j.id AND l.expires_at > NOW()
    )
  ORDER BY j.priority DESC, j.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_job.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Create lock
  INSERT INTO job_processing_locks (job_id, worker_id, expires_at)
  VALUES (v_job.id, p_worker_id, NOW() + p_lock_duration);
  
  -- Update job status
  UPDATE job_queue
  SET status = 'processing',
      started_at = NOW(),
      updated_at = NOW()
  WHERE id = v_job.id;
  
  RETURN QUERY SELECT v_job.id, v_job.job_type, v_job.priority, v_job.payload;
END;
$$ LANGUAGE plpgsql;
```

### Core Queue Implementation
```typescript
// src/lib/queue/types.ts
export interface Job {
  id: string;
  job_type: JobType;
  priority: number;
  status: JobStatus;
  payload: JobPayload;
  retry_count: number;
  max_retries: number;
  scheduled_at: Date;
  started_at?: Date;
  completed_at?: Date;
  failed_at?: Date;
  error_message?: string;
  error_details?: any;
}

export enum JobType {
  PROCESS_EMAIL_RECEIPT = 'process_email_receipt',
  PROCESS_OCR = 'process_ocr',
  MATCH_TRANSACTION = 'match_transaction',
  ORGANIZE_FILE = 'organize_file',
  SYNC_FREEE = 'sync_freee',
  GENERATE_REPORT = 'generate_report'
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DEAD_LETTER = 'dead_letter'
}

export type JobPayload = 
  | ProcessEmailReceiptPayload
  | ProcessOCRPayload
  | MatchTransactionPayload
  | OrganizeFilePayload
  | SyncFreeePayload
  | GenerateReportPayload;

export interface ProcessEmailReceiptPayload {
  email_id: string;
  user_id: string;
}

export interface ProcessOCRPayload {
  receipt_id: string;
  file_url: string;
}

export interface JobHandler<T extends JobPayload> {
  handle(job: Job, payload: T): Promise<void>;
}

// src/lib/queue/job-queue.ts
export class JobQueue {
  constructor(
    private db: SupabaseClient,
    private logger: Logger
  ) {}
  
  async enqueue<T extends JobPayload>(
    jobType: JobType,
    payload: T,
    options: {
      priority?: number;
      scheduledAt?: Date;
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    const {
      priority = 0,
      scheduledAt = new Date(),
      maxRetries = 3
    } = options;
    
    this.logger.info('Enqueuing job', { jobType, priority });
    
    const { data, error } = await this.db
      .from('job_queue')
      .insert({
        job_type: jobType,
        priority,
        payload,
        scheduled_at: scheduledAt,
        max_retries: maxRetries
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(`Failed to enqueue job: ${error.message}`);
    }
    
    return data.id;
  }
  
  async enqueueBatch<T extends JobPayload>(
    jobs: Array<{
      jobType: JobType;
      payload: T;
      priority?: number;
    }>
  ): Promise<string[]> {
    const jobRecords = jobs.map(job => ({
      job_type: job.jobType,
      priority: job.priority || 0,
      payload: job.payload,
      scheduled_at: new Date()
    }));
    
    const { data, error } = await this.db
      .from('job_queue')
      .insert(jobRecords)
      .select('id');
    
    if (error) {
      throw new Error(`Failed to enqueue batch: ${error.message}`);
    }
    
    return data.map(d => d.id);
  }
  
  async dequeue(
    workerId: string,
    jobTypes: JobType[]
  ): Promise<Job | null> {
    const { data, error } = await this.db
      .rpc('acquire_job_lock', {
        p_worker_id: workerId,
        p_job_types: jobTypes
      })
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.job_id,
      job_type: data.job_type as JobType,
      priority: data.priority,
      payload: data.payload,
      status: JobStatus.PROCESSING,
      retry_count: 0,
      max_retries: 3,
      scheduled_at: new Date(),
      started_at: new Date()
    };
  }
  
  async markCompleted(jobId: string): Promise<void> {
    await this.db
      .from('job_queue')
      .update({
        status: JobStatus.COMPLETED,
        completed_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', jobId);
    
    await this.releaseLock(jobId);
  }
  
  async markFailed(
    jobId: string,
    error: Error,
    shouldRetry: boolean = true
  ): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) return;
    
    const nextRetryCount = job.retry_count + 1;
    const canRetry = shouldRetry && nextRetryCount <= job.max_retries;
    
    if (canRetry) {
      // Calculate next retry time with exponential backoff
      const backoffMinutes = Math.pow(2, nextRetryCount) * 5;
      const nextScheduledAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
      
      await this.db
        .from('job_queue')
        .update({
          status: JobStatus.PENDING,
          retry_count: nextRetryCount,
          scheduled_at: nextScheduledAt,
          error_message: error.message,
          error_details: { stack: error.stack },
          updated_at: new Date()
        })
        .eq('id', jobId);
    } else {
      // Move to dead letter queue
      await this.moveToDeadLetter(job, error);
    }
    
    await this.releaseLock(jobId);
  }
  
  private async moveToDeadLetter(job: Job, error: Error): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Update job status
      await tx
        .from('job_queue')
        .update({
          status: JobStatus.DEAD_LETTER,
          failed_at: new Date(),
          error_message: error.message,
          error_details: { stack: error.stack },
          updated_at: new Date()
        })
        .eq('id', job.id);
      
      // Insert into dead letter queue
      await tx
        .from('job_dead_letter_queue')
        .insert({
          original_job_id: job.id,
          job_type: job.job_type,
          payload: job.payload,
          error_history: [{
            error_message: error.message,
            error_details: { stack: error.stack },
            occurred_at: new Date()
          }]
        });
    });
  }
  
  private async releaseLock(jobId: string): Promise<void> {
    await this.db
      .from('job_processing_locks')
      .delete()
      .eq('job_id', jobId);
  }
  
  async getJob(jobId: string): Promise<Job | null> {
    const { data } = await this.db
      .from('job_queue')
      .select('*')
      .eq('id', jobId)
      .single();
    
    return data;
  }
  
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    deadLetter: number;
  }> {
    const { data } = await this.db
      .from('job_queue')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000)); // Last 24 hours
    
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      deadLetter: 0
    };
    
    data?.forEach(job => {
      switch (job.status) {
        case JobStatus.PENDING:
          stats.pending++;
          break;
        case JobStatus.PROCESSING:
          stats.processing++;
          break;
        case JobStatus.COMPLETED:
          stats.completed++;
          break;
        case JobStatus.FAILED:
          stats.failed++;
          break;
        case JobStatus.DEAD_LETTER:
          stats.deadLetter++;
          break;
      }
    });
    
    return stats;
  }
}

// src/lib/queue/job-processor.ts
export class JobProcessor {
  private isRunning = false;
  private workers: Map<string, Worker> = new Map();
  
  constructor(
    private queue: JobQueue,
    private handlers: Map<JobType, JobHandler<any>>,
    private logger: Logger,
    private config: {
      maxWorkers: number;
      pollInterval: number;
      jobTypes: JobType[];
    }
  ) {}
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.logger.info('Starting job processor', { 
      maxWorkers: this.config.maxWorkers,
      jobTypes: this.config.jobTypes 
    });
    
    // Start workers
    for (let i = 0; i < this.config.maxWorkers; i++) {
      this.startWorker(`worker-${i}`);
    }
  }
  
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Wait for all workers to finish
    await Promise.all(
      Array.from(this.workers.values()).map(w => w.stop())
    );
    
    this.workers.clear();
  }
  
  private async startWorker(workerId: string): Promise<void> {
    const worker = new Worker(
      workerId,
      this.queue,
      this.handlers,
      this.logger,
      this.config
    );
    
    this.workers.set(workerId, worker);
    
    worker.on('error', (error) => {
      this.logger.error('Worker error', { workerId, error });
      
      // Restart worker after delay
      setTimeout(() => {
        if (this.isRunning) {
          this.startWorker(workerId);
        }
      }, 5000);
    });
    
    await worker.start();
  }
}

class Worker extends EventEmitter {
  private isRunning = false;
  private currentJob: Job | null = null;
  
  constructor(
    private id: string,
    private queue: JobQueue,
    private handlers: Map<JobType, JobHandler<any>>,
    private logger: Logger,
    private config: {
      pollInterval: number;
      jobTypes: JobType[];
    }
  ) {
    super();
  }
  
  async start(): Promise<void> {
    this.isRunning = true;
    this.processJobs();
  }
  
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Wait for current job to complete
    if (this.currentJob) {
      await this.waitForJobCompletion();
    }
  }
  
  private async processJobs(): Promise<void> {
    while (this.isRunning) {
      try {
        const job = await this.queue.dequeue(this.id, this.config.jobTypes);
        
        if (job) {
          this.currentJob = job;
          await this.processJob(job);
          this.currentJob = null;
        } else {
          // No jobs available, wait before polling again
          await new Promise(resolve => 
            setTimeout(resolve, this.config.pollInterval)
          );
        }
      } catch (error) {
        this.emit('error', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  private async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.job_type);
    
    if (!handler) {
      this.logger.error('No handler for job type', { jobType: job.job_type });
      await this.queue.markFailed(
        job.id,
        new Error(`No handler for job type: ${job.job_type}`),
        false
      );
      return;
    }
    
    try {
      this.logger.info('Processing job', { 
        jobId: job.id,
        jobType: job.job_type 
      });
      
      await handler.handle(job, job.payload);
      
      await this.queue.markCompleted(job.id);
      
      this.logger.info('Job completed', { 
        jobId: job.id,
        jobType: job.job_type 
      });
    } catch (error) {
      this.logger.error('Job processing failed', { 
        jobId: job.id,
        jobType: job.job_type,
        error 
      });
      
      await this.queue.markFailed(job.id, error as Error);
    }
  }
  
  private async waitForJobCompletion(): Promise<void> {
    // Wait up to 30 seconds for job to complete
    const maxWait = 30000;
    const startTime = Date.now();
    
    while (this.currentJob && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

### Retry Policy
```typescript
// src/lib/queue/retry-policy.ts
export interface RetryPolicy {
  shouldRetry(error: Error, retryCount: number): boolean;
  getNextRetryDelay(retryCount: number): number;
}

export class ExponentialBackoffRetryPolicy implements RetryPolicy {
  constructor(
    private maxRetries: number = 3,
    private baseDelayMs: number = 5000,
    private maxDelayMs: number = 300000 // 5 minutes
  ) {}
  
  shouldRetry(error: Error, retryCount: number): boolean {
    // Don't retry validation errors
    if (error.name === 'ValidationError') {
      return false;
    }
    
    // Don't retry if max retries reached
    if (retryCount >= this.maxRetries) {
      return false;
    }
    
    // Retry network and timeout errors
    if (this.isRetryableError(error)) {
      return true;
    }
    
    return false;
  }
  
  getNextRetryDelay(retryCount: number): number {
    const delay = this.baseDelayMs * Math.pow(2, retryCount);
    return Math.min(delay, this.maxDelayMs);
  }
  
  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'NetworkError',
      'TimeoutError'
    ];
    
    return retryableErrors.some(e => 
      error.message.includes(e) || error.name === e
    );
  }
}
```

### Interface Specifications
- **Input Interfaces**: Job payloads from various sources
- **Output Interfaces**: Processed jobs and status updates
  ```typescript
  export interface JobQueueAPI {
    enqueue<T extends JobPayload>(
      jobType: JobType,
      payload: T,
      options?: JobOptions
    ): Promise<string>;
    
    enqueueBatch<T extends JobPayload>(
      jobs: JobBatch<T>[]
    ): Promise<string[]>;
    
    getQueueStats(): Promise<QueueStats>;
    getJob(jobId: string): Promise<Job | null>;
    cancelJob(jobId: string): Promise<void>;
    retryDeadLetterJob(jobId: string): Promise<void>;
  }
  ```

## Metadata
- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-05
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria
- [ ] Job queue tables are created with proper indexes
- [ ] Jobs can be enqueued with priority and scheduling
- [ ] Workers can process jobs concurrently
- [ ] Failed jobs are retried with exponential backoff
- [ ] Dead letter queue captures permanently failed jobs
- [ ] Queue monitoring provides real-time statistics

### Verification Commands
```bash
# Check queue status
npm run queue:status
# Process jobs manually
npm run queue:process
# Check dead letter queue
npm run queue:dead-letter
# Run queue tests
npm test -- queue
```

## Dependencies
- **Required**: PBI-2-5-1 - pg_cron setup for job scheduling
- **Required**: Database infrastructure

## Testing Requirements
- Unit tests: Queue operations with mocked database
- Integration tests: Multi-worker processing scenarios
- Performance tests: Queue throughput under load
- Stress tests: Handling worker failures and recovery

## Estimate
2 story points

## Priority
High - Core infrastructure for asynchronous processing

## Implementation Notes
- Consider using Redis for higher performance if needed
- Monitor queue depth and processing latency
- Implement circuit breaker for external service calls
- Add metrics for job processing time and success rates
- Consider implementing job priorities dynamically based on user tier
