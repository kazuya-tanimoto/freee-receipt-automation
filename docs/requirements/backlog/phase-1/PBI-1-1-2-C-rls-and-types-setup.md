# PBI-1-1-2-C: RLS and Types Setup

## Description
Configure Row Level Security (RLS) policies for all database tables and generate TypeScript types for the freee receipt automation system. This ensures data isolation between users and provides type-safe database operations.

## Implementation Details

### Files to Create/Modify
1. `supabase/migrations/003_rls_policies.sql` - Row Level Security policies
2. `src/types/database/index.ts` - Combined TypeScript types export
3. `src/lib/database/policies.ts` - RLS policy helpers
4. `docs/database/security.md` - Security policy documentation

### Technical Requirements
- Enable RLS on all user data tables
- Create policies for INSERT, SELECT, UPDATE, DELETE operations
- Generate TypeScript types using Supabase CLI
- Implement policy helper functions for common operations
- Test all policies with different user scenarios

### RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

-- Receipts policies
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Processing logs policies
CREATE POLICY "Users can view own logs" ON public.processing_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.processing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### TypeScript Type Generation
```bash
# Generate types from database schema
npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database/supabase.ts
```

### Code Patterns to Follow
- Use auth.uid() for user identification in policies
- Implement both FOR and WITH CHECK clauses where needed
- Export combined types from index.ts
- Use helper functions for complex policy logic

### Interface Specifications
- **Input Interfaces**: Requires tables from PBI-1-1-2-A and PBI-1-1-2-B
- **Output Interfaces**: Provides secure database access patterns
  ```typescript
  // Export all database types
  export type { Database } from './supabase';
  export type { UserSettings, Receipt, Transaction, ProcessingLog } from './supabase';
  
  // Helper types for common operations
  export type DatabaseInsert<T extends keyof Database['public']['Tables']> = 
    Database['public']['Tables'][T]['Insert'];
  
  export type DatabaseUpdate<T extends keyof Database['public']['Tables']> = 
    Database['public']['Tables'][T]['Update'];
  ```

## Metadata
- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-04
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria
- [ ] RLS is enabled on all user data tables
- [ ] All CRUD operations are properly secured by policies
- [ ] TypeScript types are generated and up-to-date
- [ ] Policy helper functions are implemented
- [ ] Security documentation is complete
- [ ] All policies tested with different user scenarios

### Verification Commands
```bash
# Test RLS policies
npm run test:rls
# Generate and verify types
npx supabase gen types typescript --check
# Run security audit
npm run audit:security
```

## Dependencies
- **Required**: PBI-1-1-2-A - Core tables must exist
- **Required**: PBI-1-1-2-B - Transaction tables must exist

## Testing Requirements
- Unit tests: Test policy helper functions
- Integration tests: Test RLS enforcement with multiple users
- Test data: Sample users with different access scenarios

## Estimate
1 story point

## Priority
High - Security policies required before any user data operations

## Implementation Notes
- Test RLS policies thoroughly with different user contexts
- Ensure TypeScript types are automatically regenerated in CI
- Document any custom policy logic for future maintenance
- Consider service role bypass policies for admin operations
