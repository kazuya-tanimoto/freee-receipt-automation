# PBI-5-2-7: Rule Management UI - Basic Features

## Description

Implement basic user interface for viewing and managing generated matching rules including rule listing, basic
filtering, and rule status management. This provides users with visibility and control over the rule generation system.

## Implementation Details

### Files to Create/Modify

1. `src/components/rules/RuleListView.tsx` - Rule listing component
2. `src/components/rules/RuleCard.tsx` - Individual rule display component
3. `src/components/rules/RuleStatusToggle.tsx` - Rule enable/disable toggle
4. `src/app/dashboard/rules/page.tsx` - Rules management page
5. `src/lib/rules/rule-ui-helpers.ts` - UI utility functions

### Technical Requirements

- Display rules in paginated list with sorting
- Show rule details including type, confidence, and performance
- Support basic filtering by rule type and status
- Enable/disable rules with confirmation dialogs
- Responsive design for mobile and desktop viewing

### UI Architecture

```typescript
interface RuleListViewProps {
  rules: MatchingRule[];
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
  onRuleSelect: (rule: MatchingRule) => void;
  loading?: boolean;
}

interface RuleCardProps {
  rule: MatchingRule;
  showActions?: boolean;
  compact?: boolean;
  onToggle?: (enabled: boolean) => void;
}

interface RuleFilter {
  type?: RuleType[];
  status?: 'active' | 'inactive' | 'all';
  confidence?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}
```

### Rule Display Components

```typescript
interface RuleDisplayData {
  id: string;
  title: string;
  description: string;
  type: RuleType;
  status: 'active' | 'inactive';
  confidence: number;
  performance: RulePerformanceMetrics;
  createdAt: Date;
  lastApplied?: Date;
}

interface RulePerformanceMetrics {
  successRate: number;
  totalApplications: number;
  averageConfidence: number;
  trend: 'improving' | 'declining' | 'stable';
}
```

## Acceptance Criteria

- [ ] Display rules in organized, paginated list
- [ ] Show rule details including confidence and performance
- [ ] Support filtering by type, status, and confidence
- [ ] Enable/disable rules with user confirmation
- [ ] Provide responsive design for all screen sizes
- [ ] Show loading states and error handling

## Dependencies

- **Required**: PBI-5-2-6 (Rule Validation System)
- **Required**: PBI-3-1-3 (Basic UI Components)

## Testing Requirements

- Unit tests: Component rendering and interactions
- Integration tests: Rule management operations
- Visual tests: UI layout and responsiveness

## Estimate

1 story point

## Priority

Medium - Improves user control and transparency

## Implementation Notes

- Use Next.js App Router for page structure
- Implement optimistic UI updates for rule toggles
- Consider virtual scrolling for large rule lists
