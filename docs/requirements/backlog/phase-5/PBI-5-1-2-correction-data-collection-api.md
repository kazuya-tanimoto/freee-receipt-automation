# PBI-5-1-2: Correction Data Collection API

## Description

Implement Server Actions and API layer for collecting user correction data from manual
matching adjustments. This includes data validation, storage, and basic analytics
collection mechanisms.

## Implementation Details

### Files to Create/Modify

1. `src/app/actions/corrections.ts` - Server Actions for correction data
2. `src/lib/corrections/collector.ts` - Correction data collection service
3. `src/lib/corrections/validator.ts` - Input validation and sanitization
4. `src/types/corrections.ts` - Update with API types
5. `src/lib/supabase/corrections.ts` - Update with collection methods

### Technical Requirements

- Use Next.js Server Actions for secure data collection
- Implement input validation and sanitization
- Rate limiting: 100 corrections per user per hour
- Automatic metadata collection (timestamp, user agent)
- Error handling and logging

### API Architecture

```typescript
// Server Actions
async function collectCorrection(
  correctionData: CreateCorrectionData
): Promise<UserCorrection>;

async function getCorrectionHistory(
  userId: string,
  limit?: number
): Promise<UserCorrection[]>;

// Collection Service
interface CorrectionCollector {
  collect(data: CreateCorrectionData): Promise<UserCorrection>;
  validate(data: CreateCorrectionData): ValidationResult;
  sanitize(data: CreateCorrectionData): CreateCorrectionData;
}
```

### Input Validation

```typescript
interface CreateCorrectionData {
  receiptId: string;
  transactionId?: string;
  correctionType: CorrectionType;
  beforeData: CorrectionData;
  afterData: CorrectionData;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Acceptance Criteria

- [ ] Server Actions handle correction data securely
- [ ] Input validation prevents malicious data
- [ ] Rate limiting protects against abuse
- [ ] Corrections are stored with proper metadata
- [ ] Error handling provides useful feedback
- [ ] User can retrieve their correction history

## Dependencies

- **Required**: PBI-5-1-1 (Correction Data Table)
- **Required**: PBI-3-3 (Manual Adjustment Features)

## Testing Requirements

- Unit tests: Validation and sanitization functions
- Integration tests: Server Actions and database operations
- Test data: Various correction scenarios

## Estimate

1 story point

## Priority

High - Core functionality for Phase 5 learning

## Implementation Notes

- Use Zod for robust input validation
- Implement proper error boundaries
- Log corrections for debugging and analytics
