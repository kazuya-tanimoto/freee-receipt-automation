# PBI-2-5-1: pg_cron Setup and Schedule Job Foundation

## Description
Set up Supabase pg_cron extension and create the foundation for scheduled job execution. This includes enabling the extension, creating job configuration tables, and implementing basic scheduling infrastructure for the receipt processing pipeline.

## Implementation Details

### Files to Create/Modify
1. `supabase/migrations/007_enable_pg_cron.sql` - Enable pg_cron extension
2. `supabase/migrations/008_create_job_tables.sql` - Create job management tables
3. `src/lib/scheduler/types.ts` - TypeScript types for scheduled jobs
4. `src/lib/scheduler/job-manager.ts` - Job management service
5. `src/lib/scheduler/constants.ts` - Schedule constants and configurations
6. `scripts/setup-cron-jobs.ts` - Script to initialize cron jobs

### Technical Requirements
- Enable pg_cron extension in Supabase
- Create job configuration and history tables
- Implement job scheduling with flexible intervals
- Support for job enabling/disabling
- Job execution history tracking

### Database Schema
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create job configuration table
CREATE TABLE job_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT UNIQUE NOT NULL,
  schedule TEXT NOT NULL, -- cron expression
  command TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job execution history
CREATE TABLE job_execution_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES job_configurations(id),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  error_message TEXT,
  execution_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_job_history_job_id ON job_execution_history(job_id);
CREATE INDEX idx_job_history_status ON job_execution_history(status);
CREATE INDEX idx_job_history_started_at ON job_execution_history(started_at DESC);
```

### Job Manager Implementation
```typescript
// src/lib/scheduler/types.ts
export interface JobConfiguration {
  id: string;
  job_name: string;
  schedule: string; // cron expression
  command: string;
  description?: string;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JobExecutionHistory {
  id: string;
  job_id: string;
  started_at: Date;
  completed_at?: Date;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  error_message?: string;
  execution_details?: Record<string, any>;
}

export interface ScheduleConfig {
  DAILY_PROCESSING: string;
  WEEKLY_PROCESSING: string;
  HOURLY_EMAIL_CHECK: string;
  NIGHTLY_CLEANUP: string;
}

// src/lib/scheduler/constants.ts
export const SCHEDULE_CONFIGS: ScheduleConfig = {
  // Every day at 9 AM JST (0 UTC)
  DAILY_PROCESSING: '0 0 * * *',
  
  // Every Sunday at 10 PM JST (13 UTC)
  WEEKLY_PROCESSING: '0 13 * * 0',
  
  // Every hour during business hours (9 AM - 6 PM JST)
  HOURLY_EMAIL_CHECK: '0 0-9,15-23 * * *',
  
  // Every day at 2 AM JST (17 UTC previous day)
  NIGHTLY_CLEANUP: '0 17 * * *'
};

export const JOB_NAMES = {
  PROCESS_RECEIPTS: 'process_receipts',
  CHECK_EMAILS: 'check_emails',
  ORGANIZE_FILES: 'organize_files',
  CLEANUP_OLD_DATA: 'cleanup_old_data',
  GENERATE_REPORTS: 'generate_reports'
} as const;

// src/lib/scheduler/job-manager.ts
export class JobManager {
  constructor(
    private db: SupabaseClient,
    private logger: Logger
  ) {}
  
  async createJob(config: {
    name: string;
    schedule: string;
    command: string;
    description?: string;
  }): Promise<JobConfiguration> {
    this.logger.info('Creating scheduled job', { jobName: config.name });
    
    // Insert job configuration
    const { data, error } = await this.db
      .from('job_configurations')
      .insert({
        job_name: config.name,
        schedule: config.schedule,
        command: config.command,
        description: config.description
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
    
    // Schedule with pg_cron
    await this.scheduleCronJob(data);
    
    return data;
  }
  
  private async scheduleCronJob(job: JobConfiguration): Promise<void> {
    // Create pg_cron job
    const cronSql = `
      SELECT cron.schedule(
        $1::text,
        $2::text,
        $3::text
      );
    `;
    
    const { error } = await this.db.rpc('exec_sql', {
      sql: cronSql,
      params: [job.job_name, job.schedule, job.command]
    });
    
    if (error) {
      throw new Error(`Failed to schedule cron job: ${error.message}`);
    }
  }
  
  async updateJobSchedule(
    jobName: string,
    newSchedule: string
  ): Promise<void> {
    this.logger.info('Updating job schedule', { jobName, newSchedule });
    
    // Update configuration
    const { error: updateError } = await this.db
      .from('job_configurations')
      .update({ schedule: newSchedule, updated_at: new Date() })
      .eq('job_name', jobName);
    
    if (updateError) {
      throw new Error(`Failed to update job config: ${updateError.message}`);
    }
    
    // Reschedule pg_cron job
    await this.unscheduleCronJob(jobName);
    const job = await this.getJob(jobName);
    if (job && job.is_enabled) {
      await this.scheduleCronJob(job);
    }
  }
  
  async enableJob(jobName: string): Promise<void> {
    this.logger.info('Enabling job', { jobName });
    
    const { data: job, error } = await this.db
      .from('job_configurations')
      .update({ is_enabled: true, updated_at: new Date() })
      .eq('job_name', jobName)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to enable job: ${error.message}`);
    }
    
    await this.scheduleCronJob(job);
  }
  
  async disableJob(jobName: string): Promise<void> {
    this.logger.info('Disabling job', { jobName });
    
    await this.db
      .from('job_configurations')
      .update({ is_enabled: false, updated_at: new Date() })
      .eq('job_name', jobName);
    
    await this.unscheduleCronJob(jobName);
  }
  
  private async unscheduleCronJob(jobName: string): Promise<void> {
    const { error } = await this.db.rpc('exec_sql', {
      sql: 'SELECT cron.unschedule($1::text);',
      params: [jobName]
    });
    
    if (error) {
      this.logger.warn('Failed to unschedule cron job', { jobName, error });
    }
  }
  
  async recordJobStart(jobId: string): Promise<string> {
    const { data, error } = await this.db
      .from('job_execution_history')
      .insert({
        job_id: jobId,
        started_at: new Date(),
        status: 'running'
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(`Failed to record job start: ${error.message}`);
    }
    
    return data.id;
  }
  
  async recordJobCompletion(
    executionId: string,
    status: 'success' | 'failed',
    details?: {
      error_message?: string;
      execution_details?: Record<string, any>;
    }
  ): Promise<void> {
    await this.db
      .from('job_execution_history')
      .update({
        completed_at: new Date(),
        status,
        ...details
      })
      .eq('id', executionId);
  }
  
  async getJob(jobName: string): Promise<JobConfiguration | null> {
    const { data, error } = await this.db
      .from('job_configurations')
      .select('*')
      .eq('job_name', jobName)
      .single();
    
    if (error) {
      return null;
    }
    
    return data;
  }
  
  async getJobHistory(
    jobName: string,
    limit = 10
  ): Promise<JobExecutionHistory[]> {
    const { data } = await this.db
      .from('job_execution_history')
      .select(`
        *,
        job:job_configurations!job_id(job_name)
      `)
      .eq('job.job_name', jobName)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    return data || [];
  }
}
```

### Setup Script
```typescript
// scripts/setup-cron-jobs.ts
async function setupCronJobs() {
  const jobManager = new JobManager(supabase, logger);
  
  // Define jobs
  const jobs = [
    {
      name: JOB_NAMES.PROCESS_RECEIPTS,
      schedule: SCHEDULE_CONFIGS.DAILY_PROCESSING,
      command: 'SELECT process_receipts_batch();',
      description: 'Daily batch processing of receipts'
    },
    {
      name: JOB_NAMES.CHECK_EMAILS,
      schedule: SCHEDULE_CONFIGS.HOURLY_EMAIL_CHECK,
      command: 'SELECT check_new_receipt_emails();',
      description: 'Hourly check for new receipt emails'
    },
    {
      name: JOB_NAMES.ORGANIZE_FILES,
      schedule: SCHEDULE_CONFIGS.WEEKLY_PROCESSING,
      command: 'SELECT organize_drive_files();',
      description: 'Weekly organization of Google Drive files'
    },
    {
      name: JOB_NAMES.CLEANUP_OLD_DATA,
      schedule: SCHEDULE_CONFIGS.NIGHTLY_CLEANUP,
      command: 'SELECT cleanup_old_processing_data();',
      description: 'Nightly cleanup of old processing data'
    }
  ];
  
  // Create jobs
  for (const jobConfig of jobs) {
    try {
      const existingJob = await jobManager.getJob(jobConfig.name);
      
      if (existingJob) {
        console.log(`Job ${jobConfig.name} already exists, skipping...`);
        continue;
      }
      
      const job = await jobManager.createJob(jobConfig);
      console.log(`Created job: ${job.job_name}`);
    } catch (error) {
      console.error(`Failed to create job ${jobConfig.name}:`, error);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupCronJobs()
    .then(() => console.log('Cron jobs setup completed'))
    .catch(console.error);
}
```

### Interface Specifications
- **Input Interfaces**: Uses Supabase client and database
- **Output Interfaces**: Provides job management API
  ```typescript
  export interface JobManagerAPI {
    createJob(config: JobConfig): Promise<JobConfiguration>;
    updateJobSchedule(jobName: string, schedule: string): Promise<void>;
    enableJob(jobName: string): Promise<void>;
    disableJob(jobName: string): Promise<void>;
    recordJobStart(jobId: string): Promise<string>;
    recordJobCompletion(executionId: string, status: string): Promise<void>;
    getJob(jobName: string): Promise<JobConfiguration | null>;
    getJobHistory(jobName: string, limit?: number): Promise<JobExecutionHistory[]>;
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
- [ ] pg_cron extension is enabled in Supabase
- [ ] Job configuration and history tables are created
- [ ] Job manager service can create and manage scheduled jobs
- [ ] Jobs can be enabled/disabled dynamically
- [ ] Job execution history is tracked
- [ ] Setup script initializes all required jobs

### Verification Commands
```bash
# Verify pg_cron extension
npm run supabase:db:query "SELECT * FROM pg_extension WHERE extname = 'pg_cron';"
# Check scheduled jobs
npm run supabase:db:query "SELECT * FROM cron.job;"
# Verify job configurations
npm run supabase:db:query "SELECT * FROM job_configurations;"
# Run setup script
npm run setup:cron-jobs
```

## Dependencies
- **Required**: Supabase project with pg_cron extension available
- **Required**: Database migrations infrastructure

## Testing Requirements
- Unit tests: Job manager methods with mocked database
- Integration tests: Actual pg_cron job creation and management
- Manual verification: Check Supabase dashboard for scheduled jobs

## Estimate
1 story point

## Priority
High - Foundation for all scheduled processing features

## Implementation Notes
- pg_cron jobs run in database context, not application context
- Consider timezone handling for schedules (JST vs UTC)
- Monitor job execution performance and adjust schedules as needed
- Implement proper error handling for failed jobs
- Consider job dependencies for complex workflows
