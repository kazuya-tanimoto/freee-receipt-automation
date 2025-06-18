# PBI-5-1-1: User Correction Data Table Creation

## Description

Create database tables and types for storing user correction data from manual adjustments to receipt-transaction
matching. This includes schema design, RLS policies, and basic TypeScript type definitions.

## Implementation Details

### Files to Create/Modify

1. `supabase/migrations/0005_create_correction_tables.sql` - Database schema migration
2. `src/types/corrections.ts` - TypeScript types for correction data
3. `src/lib/supabase/corrections.ts` - Correction data access layer
4. `src/types/supabase.ts` - Update with new table types
5. `docs/database/correction-schema.md` - Documentation

### Technical Requirements

- Create `user_corrections` table with proper indexing
- Implement Row Level Security (RLS) policies
- Support JSON storage for before/after correction data
- Include metadata fields (timestamp, user, confidence)
- Use UUID primary keys for all tables

### Database Schema

```sql
CREATE TABLE user_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  correction_type TEXT NOT NULL CHECK (correction_type IN ('date', 'amount', 'vendor', 'category', 'unmatch')),
  before_data JSONB NOT NULL,
  after_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript Types

```typescript
interface UserCorrection {
  id: string;
  userId: string;
  receiptId: string;
  transactionId: string | null;
  correctionType: CorrectionType;
  beforeData: CorrectionData;
  afterData: CorrectionData;
  confidenceScore?: number;
  createdAt: string;
}

type CorrectionType = 'date' | 'amount' | 'vendor' | 'category' | 'unmatch';
```

## Acceptance Criteria

- [ ] Database migration creates correction tables successfully
- [ ] RLS policies restrict access to user's own corrections
- [ ] TypeScript types are properly defined and exported
- [ ] Migration can be rolled back cleanly
- [ ] Database indexes are created for query optimization
- [ ] Documentation includes schema diagrams

## Dependencies

- **Required**: PBI-1-1-2 (Core Tables Creation)
- **Required**: PBI-3-3 (Manual Adjustment Features)

## Testing Requirements

- Unit tests: TypeScript type validation
- Integration tests: Database migration and rollback
- Test data: Sample correction records

## Estimate

1 story point

## Priority

Medium - Foundation for Phase 5 learning features

## Implementation Notes

- Use JSONB for flexible correction data storage
- Index on user_id and created_at for performance
- Consider data retention policies for privacy
