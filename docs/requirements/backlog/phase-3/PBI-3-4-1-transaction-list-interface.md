# PBI-3-4-1: Transaction List with Matching Status

## Description

Create transaction list interface displaying freee transactions with their receipt matching status, confidence scores,
and filtering capabilities.

## Implementation Details

### Files to Create/Modify

1. `src/app/(dashboard)/transactions/page.tsx` - Transaction list page
2. `src/components/transactions/TransactionList.tsx` - Main list component
3. `src/components/transactions/MatchStatusBadge.tsx` - Status indicator
4. `src/lib/transactions/queries.ts` - Transaction database queries
5. `src/hooks/useTransactionList.ts` - Transaction list state hook

### Technical Requirements

- Integration with freee API for real-time transaction data
- Match status indicators with confidence levels
- Filtering by match status, date range, amount
- Sortable columns including match confidence
- Performance optimization for large transaction datasets

### Match Status Types

```typescript
type MatchStatus =
  | 'matched_high' // > 80% confidence
  | 'matched_medium' // 50-80% confidence
  | 'matched_low' // < 50% confidence
  | 'unmatched' // No receipt matched
  | 'manual'; // Manually matched
```

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant

## Acceptance Criteria

- [ ] Transaction list displays with match status indicators
- [ ] Match confidence is displayed with appropriate colors
- [ ] Filtering works for all transaction and match criteria
- [ ] Integration with freee API provides real-time data
- [ ] Performance is acceptable with large datasets

## Dependencies

- **Required**: PBI-3-1-5 - Application layout
- **Required**: Phase 1 - Transaction database schema and freee API

## Testing Requirements

- API integration: Test freee API connectivity
- Match accuracy: Verify match status calculations

## Estimate

2 story points

## Priority

High - Core functionality for transaction management
