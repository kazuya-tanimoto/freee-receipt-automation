# PBI-2-3-6: Track Coordination Integration

## Description

Implement track coordination functionality to enable seamless inter-track communication and workflow orchestration.
This includes integrating with the existing processing_logs table for event-driven coordination, implementing trigger
mechanisms for subsequent track activation, and ensuring reliable data handoff between different processing tracks.

## Implementation Details

### Files to Create/Modify

1. `src/lib/drive/track-coordinator.ts` - Track coordination manager
2. `src/lib/drive/events/track-events.ts` - Event definitions and types
3. `src/lib/drive/events/event-publisher.ts` - Event publishing logic
4. `src/lib/drive/events/track-trigger.ts` - Next track trigger implementation
5. `src/lib/drive/processing-log-integration.ts` - Processing logs integration
6. `src/types/track-coordination.ts` - Shared types for track coordination
7. `supabase/migrations/010_add_track_coordination_columns.sql` - DB schema updates
8. `docs/architecture/track-coordination.md` - Architecture documentation

### Technical Requirements

- Integrate with existing processing_logs table for event recording
- Implement event-driven track activation mechanism
- Support data payload passing between tracks
- Handle coordination failures with appropriate fallback
- Ensure idempotent track activation
- Monitor track execution chain status
- Support both synchronous and asynchronous coordination

### Implementation Code

#### Event Types and Interfaces

```typescript
// src/types/track-coordination.ts
export interface TrackEvent {
  trackId: string;
  eventType: 'started' | 'completed' | 'failed' | 'data_ready';
  payload: Record<string, any>;
  metadata: {
    timestamp: Date;
    correlationId: string;
    sourceTrack: string;
    targetTracks?: string[];
  };
}

export interface TrackCoordinationConfig {
  trackDependencies: Map<string, string[]>;
  eventHandlers: Map<string, EventHandler>;
  retryPolicy: RetryPolicy;
  timeoutMs: number;
}
```

#### Processing Log Integration

```typescript
// src/lib/drive/processing-log-integration.ts
export class ProcessingLogIntegration {
  async recordTrackEvent(
    userId: string,
    trackId: string,
    eventType: string,
    details: any
  ): Promise<void>;
  
  async getTrackExecutionChain(
    correlationId: string
  ): Promise<TrackExecutionRecord[]>;
  
  async checkTrackDependenciesMet(
    trackId: string,
    correlationId: string
  ): Promise<boolean>;
}
```

#### Track Trigger Implementation

```typescript
// src/lib/drive/events/track-trigger.ts
export class TrackTrigger {
  async triggerNextTrack(
    currentTrack: string,
    completionData: any
  ): Promise<void>;
  
  async handleTrackFailure(
    trackId: string,
    error: Error,
    correlationId: string
  ): Promise<void>;
}
```

## Metadata

- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-01-23
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria

- [ ] Track events are recorded in processing_logs table
- [ ] Next track is automatically triggered upon completion
- [ ] Data is successfully passed between tracks
- [ ] Failed track coordination is handled gracefully
- [ ] Circular dependencies are prevented
- [ ] Track execution chain is traceable
- [ ] Coordination works for all defined track workflows

### Verification Commands

```bash
# Test track coordination
yarn test:track-coordination

# Verify event publishing
yarn test:event-publisher

# Check processing logs integration
yarn test:processing-logs

# End-to-end track workflow test
yarn test:e2e:track-workflow
```

## Dependencies

- **Required**: PBI-2-3-1 - Drive OAuth setup
- **Required**: PBI-2-3-2 - Drive basic API operations
- **Required**: PBI-2-3-3 - Drive business logic integration
- **Required**: PBI-2-5-1 - pg_cron setup (for scheduled coordination)
- **Required**: PBI-2-5-2 - Background job queue (for async processing)
- **Required**: Existing processing_logs table from Phase 1

## Testing Requirements

- Unit tests: Event publishing and handling logic
- Integration tests: Full track coordination scenarios
- Performance tests: High-volume event processing
- Failure tests: Network failures, timeout scenarios
- End-to-end tests: Complete multi-track workflows

### Test Scenarios

1. **Happy Path**: Gmail → Drive → File Management → freee
2. **Failure Recovery**: Track failure with automatic retry
3. **Timeout Handling**: Long-running track timeout
4. **Concurrent Execution**: Multiple correlations simultaneously
5. **Data Integrity**: Verify data consistency across tracks

## Estimate

2 story points

## Priority

High - Essential for multi-track workflow automation

## Implementation Notes

- Leverage existing processing_logs table structure from Phase 1
- Follow Database-Driven Event Architecture patterns from system specifications
- Ensure compatibility with pg_cron scheduled workflows
- Consider implementing circuit breaker for track failures
- Monitor event queue depth to prevent overflow
- Implement correlation ID for end-to-end tracing
- Support both push (event-driven) and pull (polling) models
- Document track dependency graph clearly
- Consider implementing track execution timeouts
- Ensure proper cleanup of completed coordination data
