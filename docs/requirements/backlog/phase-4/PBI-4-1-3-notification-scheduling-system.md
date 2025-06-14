# PBI-4-1-3: Notification Scheduling and Delivery System

## Description

Implement notification scheduling system with support for recurring weekly summaries,
immediate critical alerts, and user-configurable delivery timing using Supabase Cron and database queue.

## Implementation Details

### Files to Create/Modify

1. `src/services/notification/NotificationScheduler.ts` - Main scheduling service
2. `src/services/notification/NotificationQueue.ts` - Queue management system
3. `src/lib/scheduler/cron-jobs.ts` - Cron job definitions
4. `src/lib/scheduler/job-types.ts` - Job type definitions
5. `src/database/migrations/notifications.sql` - Notification tables
6. `src/services/notification/DeliveryService.ts` - Delivery management
7. `src/hooks/useNotificationScheduling.ts` - React hook for scheduling
8. `src/api/notifications/schedule.ts` - API endpoints for scheduling

### Technical Requirements

- Supabase Cron for scheduled job execution
- Supabase database tables for queue management
- Webhook handling for delivery status updates
- Simple retry logic (max 3 attempts)
- Basic failed notification handling
- Priority-based queue processing

### Scheduling Architecture

```typescript
interface NotificationJob {
  id: string;
  type: "summary" | "error" | "action_required";
  priority: "low" | "normal" | "high" | "critical";
  scheduledAt: Date;
  userId: string;
  data: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  status: "pending" | "processing" | "completed" | "failed";
}

interface SchedulingConfig {
  summarySchedule: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    timezone: string;
  };
  immediateDelivery: {
    enabled: boolean;
    errorThresholds: {
      critical: number; // seconds
      high: number;
      medium: number;
    };
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
}

interface NotificationScheduler {
  scheduleWeeklySummary(
    userId: string,
    config: SchedulingConfig,
  ): Promise<string>;
  scheduleImmediateNotification(notification: NotificationJob): Promise<string>;
  cancelScheduledNotification(jobId: string): Promise<boolean>;
  updateSchedule(userId: string, config: SchedulingConfig): Promise<boolean>;
  getScheduledJobs(userId: string): Promise<NotificationJob[]>;
}
```

### State Management and Caching

- Use React Query for notification status caching
- Implement Zustand store for queue status management
- Redis caching for frequently accessed scheduling data
- Real-time updates via WebSocket for queue status

### Database Schema

```sql
CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  schedule_config JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  job_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security Considerations

- User permission validation for scheduling operations
- Rate limiting for scheduling API endpoints
- Input validation for scheduling parameters
- Secure handling of notification data in queues

### Performance Optimizations

- Batch processing for multiple notifications
- Connection pooling for database operations
- Efficient queue processing with worker threads
- Memory optimization for large notification queues
- Database indexing for scheduling queries

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant
- **Reviewer**: Human Developer

## Acceptance Criteria

- [ ] Weekly summary notifications are scheduled and delivered correctly
- [ ] Immediate notifications are sent within configured time thresholds
- [ ] Retry logic handles failed deliveries appropriately
- [ ] Queue management prevents system overload
- [ ] User can modify notification schedules
- [ ] Dead letter queue captures permanently failed notifications
- [ ] Performance remains stable under high notification volume

### Verification Commands

```bash
npm run test:notification-scheduling
npm run test:queue-management
npm run test:delivery-system
npm run monitor:queue-health
```

## Dependencies

- **Required**: PBI-4-1-1 - Email service integration
- **Required**: PBI-4-1-2 - Notification templates
- **Required**: PBI-2-5-1 - pg-cron setup (from Phase 2)

## Testing Requirements

- Unit Tests (Vitest): Scheduling logic, queue management, retry mechanisms
- Integration Tests (Testing Library): End-to-end notification flows
- Load Tests: Queue performance under high volume
- E2E Tests (Playwright): Complete scheduling and delivery workflows

### Test Coverage Requirements

- Scheduling logic: 100%
- Queue management: 95%
- Retry mechanisms: 100%
- Error handling: 95%

## Estimate

1 story point

## Priority

High - Core functionality for notification system

## Implementation Notes

- Implement proper timezone handling for global users
- Use database transactions for scheduling operations
- Add comprehensive monitoring and alerting for queue health
- Ensure graceful degradation when external services are unavailable
- Implement circuit breaker pattern for external service calls
