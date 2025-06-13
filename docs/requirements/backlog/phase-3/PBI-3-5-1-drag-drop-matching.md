# PBI-3-5-1: Drag and Drop Matching Interface

## Description

Create intuitive drag-and-drop interface for manually matching receipts with transactions,
including visual feedback, validation, and conflict resolution.

## Implementation Details

### Files to Create/Modify

1. `src/app/(dashboard)/transactions/matching/page.tsx` - Matching interface page
2. `src/components/matching/MatchingWorkspace.tsx` - Main workspace
3. `src/components/matching/DraggableReceipt.tsx` - Draggable receipt item
4. `src/components/matching/DroppableTransaction.tsx` - Drop target
5. `src/lib/matching/validation.ts` - Match validation rules
6. `src/hooks/useDragAndDrop.ts` - Drag and drop state

### Technical Requirements

- HTML5 Drag and Drop API with @dnd-kit for accessibility
- Real-time validation during drag operations
- Visual feedback for valid/invalid drop zones
- Undo/redo functionality for matching operations
- Keyboard navigation support as fallback
- Touch device compatibility

### Validation Rules

```typescript
interface MatchingValidationRules {
  amountTolerance: number; // 5% tolerance for amount differences
  dateTolerance: number; // 30 days tolerance for date differences
  lowConfidenceThreshold: number; // Warn for matches below 50% confidence
}

interface MatchValidationResult {
  isValid: boolean;
  confidence: number;
  warnings: string[];
  conflicts: MatchConflict[];
}

interface MatchConflict {
  type: "amount" | "date" | "duplicate" | "status";
  severity: "low" | "medium" | "high";
  message: string;
  suggestedAction?: string;
}
```

### State Management Architecture

- Use Zustand for drag-and-drop state management
- Implement optimistic updates with rollback capability
- Cache validation results for performance
- Use React Query for server synchronization

### Performance Specifications

```typescript
interface DragPerformanceConfig {
  throttleMs: 16; // 60fps smooth dragging
  debounceValidationMs: 300; // Debounced validation
  virtualScrollThreshold: 100; // Items before virtualization
  maxConcurrentValidations: 5; // Prevent validation bottlenecks
}
```

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant

## Acceptance Criteria

- [ ] Receipts can be dragged and dropped onto transactions
- [ ] Visual feedback shows valid/invalid drop zones
- [ ] Match validation prevents incompatible matches
- [ ] Undo/redo functionality works for all operations
- [ ] Keyboard navigation provides accessible fallback
- [ ] Touch devices support drag operations

## Dependencies

- **Required**: PBI-3-3-1 - Receipt list (receipt data)
- **Required**: PBI-3-4-1 - Transaction list (transaction data)
- **Required**: Phase 1 - Receipt-transaction matching schema

### Security Considerations

- Input validation for drag data to prevent XSS
- Rate limiting for validation requests
- User permission checks for matching operations
- Audit logging for all matching actions

### Performance Optimizations

- Virtual scrolling for large datasets
- Memoized validation functions
- Throttled drag events for smooth performance
- Debounced server requests during drag operations

## Testing Requirements

- Unit Tests (Vitest): Validation logic, state management, utility functions
- Integration Tests (Testing Library): Drag interactions, validation flows
- E2E Tests (Playwright): Complete matching workflows, error scenarios
- Accessibility Tests: Keyboard navigation, screen reader support, focus management
- Performance Tests: Large dataset handling, smooth drag operations

### Test Coverage Requirements

- Validation logic: 100%
- Drag interactions: 95%
- Error handling: 90%
- Accessibility: 100%

## Estimate

2 story points

## Priority

High - Critical for manual matching when automatic matching fails
