# Database Security Documentation

This document describes the database security implementation for the freee receipt automation system.

## Overview

This system uses Supabase's Row Level Security (RLS) to ensure data isolation between users. RLS policies are applied to all user data tables, allowing authenticated users to access only their own data.

## RLS (Row Level Security) Policies

### Enabled Tables

RLS is enabled on the following tables:

- `user_settings` - User settings
- `receipts` - Receipt information
- `transactions` - Transaction data
- `processing_logs` - Processing logs

### Policy Overview

#### 1. User Settings Table

```sql
-- Users can only view their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

-- Users can only insert their own settings
CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own settings
CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. Receipts Table

```sql
-- Users can only view their own receipts
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own receipts
CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own receipts
CREATE POLICY "Users can update own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own receipts
CREATE POLICY "Users can delete own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3. Transactions Table

```sql
-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own transactions
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
```

#### 4. Processing Logs Table

```sql
-- Users can only view their own logs
CREATE POLICY "Users can view own logs" ON public.processing_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own logs
CREATE POLICY "Users can insert own logs" ON public.processing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Security Principles

### 1. Authentication Required

- All database operations require authentication
- Use `auth.uid()` to identify users
- Unauthenticated users cannot access data

### 2. Data Isolation

- Users can only access their own data
- Other users' data is completely isolated
- No admin privilege concept currently implemented

### 3. Operation Restrictions

- SELECT: Can only view own data
- INSERT: Can only create with own user_id
- UPDATE: Can only update own data
- DELETE: Can only delete own data (receipts table only)

## RLS Policy Helper Functions

Helper functions for easy RLS operations are provided in `src/lib/database/policies.ts`.

### Key Features

#### 1. User Context Validation

```typescript
export function validateUserContext(context: RLSContext): void {
  if (!context.is_authenticated) {
    throw new RLSPolicyError('User must be authenticated', context);
  }
  
  if (!context.user_id) {
    throw new RLSPolicyError('User ID is required', context);
  }
}
```

#### 2. Secure Client Creation

```typescript
export function createSecureClient(context: RLSContext) {
  validateUserContext(context);
  return createServerClient();
}
```

#### 3. Table-Specific Policy Helpers

- `userSettingsPolicies` - User settings operations
- `receiptPolicies` - Receipt operations
- `transactionPolicies` - Transaction operations
- `processingLogPolicies` - Log operations

## Security Testing

### Testing Strategy

1. **Authentication Tests**
   - Verify unauthenticated users cannot access data
   - Verify authenticated users can access their own data

2. **Authorization Tests**
   - Verify User A cannot access User B's data
   - Verify proper RLS policy enforcement for each CRUD operation

3. **Error Handling Tests**
   - Verify proper errors on unauthorized access attempts
   - Verify RLSPolicyError is thrown appropriately

### Test Commands

```bash
# Test RLS policies
npm run test:rls

# Run security audit
npm run audit:security

# Verify TypeScript types
npx supabase gen types typescript --check
```

## Security Configuration

### Environment Variables

Ensure the following environment variables are properly configured:

```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# RLS enforcement mode (recommended)
SUPABASE_RLS_ENABLED=true
```

### Database Configuration

```sql
-- Enable RLS enforcement mode
ALTER DATABASE postgres SET row_security = on;

-- Force RLS even for Supabase service role
ALTER ROLE service_role SET row_security = on;
```

## Monitoring and Auditing

### Log Monitoring

Recommend monitoring the following events:

1. **Authentication Failures**
   - Invalid token access attempts
   - Expired session access attempts

2. **Authorization Violations**
   - RLS policy violation attempts
   - Unauthorized access to other users' data

3. **Unusual Access Patterns**
   - Bulk data access
   - Access during unusual hours

### Alert Configuration

```sql
-- Monitor authorization violations
CREATE OR REPLACE FUNCTION log_rls_violations()
RETURNS trigger AS $$
BEGIN
  -- Log RLS policy violations
  INSERT INTO security_logs (event_type, user_id, details, created_at)
  VALUES ('rls_violation', auth.uid(), NEW, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Best Practices and Considerations

### 1. Service Role Usage

- Service role can bypass RLS
- Do not use service role except for admin operations
- Strictly manage service role keys

### 2. Client-Side Security

- Implement proper permission checks in frontend
- RLS serves as the last line of defense
- User interface level access control is also important

### 3. Error Handling

- Do not expose detailed security error information
- Log details but show generic messages to users
- Do not provide useful information to attackers

### 4. Regular Auditing

- Regular review of RLS policies
- Automate security testing
- Regular analysis of access logs

## Related Files

- [`supabase/migrations/003_rls_policies.sql`](../../supabase/migrations/003_rls_policies.sql) - RLS policy definitions
- [`src/lib/database/policies.ts`](../../src/lib/database/policies.ts) - Policy helper functions
- [`src/types/database/index.ts`](../../src/types/database/index.ts) - TypeScript type definitions

## Change History

| Date | Changes | Author |
|------|---------|--------|
| 2025-06-17 | Initial version | AI Assistant |

## Contact

For security-related questions or concerns, please contact the development team.