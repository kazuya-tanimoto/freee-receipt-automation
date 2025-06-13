# PBI-3-3-1: Receipt List Interface with Filtering

## Description

Create a comprehensive receipt list page with search, filtering, sorting, and pagination
for managing and reviewing all processed receipts.

## Implementation Details

### Files to Create/Modify

1. `src/app/(dashboard)/receipts/page.tsx` - Receipt list page
2. `src/components/receipts/ReceiptList.tsx` - Main list component
3. `src/components/receipts/ReceiptCard.tsx` - Individual receipt card
4. `src/components/receipts/ReceiptFilters.tsx` - Filter controls
5. `src/lib/receipts/queries.ts` - Receipt database queries
6. `src/hooks/useReceiptFilters.ts` - Filter state management

### Technical Requirements

- Server-side pagination for performance with large datasets
- Real-time search with debouncing across vendor names and filenames
- Multiple filter criteria: date range, status, amount, vendor
- Sortable columns: date, amount, vendor, status, confidence
- Bulk selection and operations
- Responsive design for mobile and desktop

### Filter Interface

```typescript
interface ReceiptFilters {
  search?: string;
  dateRange?: { from: Date; to: Date };
  status?: Array<"pending" | "processed" | "error">;
  amountRange?: { min: number; max: number };
  vendorNames?: string[];
}
```

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant

## Acceptance Criteria

- [ ] Receipt list displays with proper pagination
- [ ] Search filters results across vendor names and filenames
- [ ] Date and amount range filters work correctly
- [ ] Sorting functions for all supported columns
- [ ] Bulk selection allows multiple receipt operations
- [ ] Loading and error states are handled properly

## Dependencies

- **Required**: PBI-3-1-5 - Application layout
- **Required**: Phase 1 - Receipt database schema

## Testing Requirements

- Performance: Test with 10,000+ receipts
- Filter accuracy: Verify all filter combinations work

## Estimate

2 story points

## Priority

High - Core functionality for receipt management
