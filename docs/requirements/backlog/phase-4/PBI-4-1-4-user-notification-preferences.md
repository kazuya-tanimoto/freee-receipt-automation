# PBI-4-1-4: User Notification Preferences Management

## Description

Implement comprehensive user notification preferences system allowing users to configure
notification types, delivery schedules, and communication channels with real-time updates and profile integration.

## Implementation Details

### Files to Create/Modify

1. `src/app/(dashboard)/settings/notifications/page.tsx` - Notification settings page
2. `src/components/settings/NotificationPreferences.tsx` - Preferences form component
3. `src/components/settings/ScheduleSelector.tsx` - Schedule configuration component
4. `src/lib/preferences/types.ts` - Preference type definitions
5. `src/services/preferences/PreferencesService.ts` - Preferences management service
6. `src/hooks/useNotificationPreferences.ts` - React hook for preferences
7. `src/api/preferences/notifications.ts` - API endpoints for preferences
8. `src/database/migrations/user-preferences.sql` - User preferences table

### Technical Requirements

- Integration with Phase 3 settings UI components
- Real-time preference validation and preview
- Timezone-aware scheduling configuration
- Preference inheritance and defaults
- Bulk preference operations
- Import/export functionality for preferences
- A/B testing support for preference UX

### Preference System Architecture

```typescript
interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    address: string;
    verified: boolean;
  };
  notifications: {
    processingSummary: {
      enabled: boolean;
      frequency: "weekly" | "biweekly" | "monthly";
      dayOfWeek: number; // 0-6
      hour: number; // 0-23
      timezone: string;
    };
    errorAlerts: {
      enabled: boolean;
      severity: ("low" | "medium" | "high" | "critical")[];
      immediateDelivery: boolean;
    };
    actionRequired: {
      enabled: boolean;
      immediateDelivery: boolean;
      reminderInterval: number; // hours
      maxReminders: number;
    };
  };
  globalSettings: {
    doNotDisturb: {
      enabled: boolean;
      startTime: string; // HH:mm
      endTime: string; // HH:mm
      timezone: string;
    };
    consolidation: {
      enabled: boolean;
      windowMinutes: number;
    };
  };
}

interface PreferencesService {
  getPreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<boolean>;
  resetToDefaults(userId: string): Promise<NotificationPreferences>;
  validatePreferences(
    preferences: NotificationPreferences,
  ): Promise<ValidationResult>;
  previewSchedule(
    preferences: NotificationPreferences,
  ): Promise<SchedulePreview>;
}
```

### UI Component Specifications

- Use shadcn/ui form components from Phase 3
- Implement real-time schedule preview
- Add timezone selector with auto-detection
- Include preference validation feedback
- Support for bulk enable/disable operations
- Responsive design for mobile settings access

### Database Schema

```sql
CREATE TABLE user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  email_address TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  processing_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  processing_summary_frequency TEXT NOT NULL DEFAULT 'weekly',
  processing_summary_day_of_week INTEGER NOT NULL DEFAULT 1,
  processing_summary_hour INTEGER NOT NULL DEFAULT 9,
  error_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  error_alerts_severity TEXT[] NOT NULL DEFAULT ARRAY['high', 'critical'],
  action_required_enabled BOOLEAN NOT NULL DEFAULT true,
  action_required_immediate BOOLEAN NOT NULL DEFAULT true,
  dnd_enabled BOOLEAN NOT NULL DEFAULT false,
  dnd_start_time TIME,
  dnd_end_time TIME,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### State Management Integration

- Integrate with Phase 3 Zustand store
- Use React Query for preference caching
- Implement optimistic updates for UI responsiveness
- Real-time sync across multiple browser tabs

### Security Considerations

- Email address verification workflow
- User permission validation for preference access
- Rate limiting for preference update operations
- Secure handling of timezone and schedule data

### Performance Optimizations

- Preference caching with TTL
- Lazy loading of timezone data
- Debounced preference updates
- Efficient database queries with proper indexing

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant
- **Reviewer**: Human Developer

## Acceptance Criteria

- [ ] Users can configure all notification types and schedules
- [ ] Timezone selection works correctly with auto-detection
- [ ] Email verification workflow functions properly
- [ ] Do not disturb settings are respected
- [ ] Schedule preview shows accurate timing
- [ ] Preferences are saved and applied immediately
- [ ] Settings UI is intuitive and responsive
- [ ] Bulk operations work for multiple preferences

### Verification Commands

```bash
npm run test:notification-preferences
npm run test:preference-ui
npm run test:timezone-handling
```

## Dependencies

- **Required**: PBI-3-6-1 - User settings (from Phase 3)
- **Required**: PBI-4-1-1 - Email service integration
- **Required**: PBI-4-1-3 - Notification scheduling system

## Testing Requirements

- Unit Tests (Vitest): Preference validation, timezone handling, service functions
- Integration Tests (Testing Library): Settings form interactions, preference updates
- E2E Tests (Playwright): Complete preference configuration workflows
- Accessibility Tests: Settings form accessibility and keyboard navigation

### Test Coverage Requirements

- Preference validation: 100%
- Settings UI interactions: 95%
- Timezone handling: 100%
- Database operations: 95%

## Estimate

1 story point

## Priority

Medium - Important for user experience but builds on notification foundation

## Implementation Notes

- Implement progressive disclosure for advanced settings
- Add helpful tooltips and explanations for complex settings
- Ensure proper handling of timezone changes and daylight saving
- Provide sensible defaults based on user location and behavior
- Include preference migration logic for future updates
