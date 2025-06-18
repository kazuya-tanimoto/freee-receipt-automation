# PBI-1-1-3: Transaction Tables Creation

## Description

Create the transaction-related database tables for the freee receipt automation system. This includes the transactions
table for storing freee API data and the processing_logs table for tracking system operations and debugging.

## Implementation Details

### Files to Create/Modify

1. `supabase/migrations/002_transaction_tables.sql` - Transaction tables creation
2. `src/types/database/transactions.ts` - TypeScript types for transaction tables
3. `docs/database/transaction-schema.md` - Transaction tables documentation

### Technical Requirements

- Use PostgreSQL 14+ features
- Enable proper indexing for transaction queries
- Set up foreign key constraints with cascade behavior
- Include audit fields (created_at, updated_at)
- Support JSONB for flexible log data storage

### Database Schema

```sql
-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freee_transaction_id TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  account_item_id INTEGER,
  matched_receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  matching_confidence DECIMAL(3, 2) CHECK (matching_confidence >= 0 AND matching_confidence <= 1),
  matching_status TEXT DEFAULT 'unmatched' CHECK (matching_status IN ('unmatched', 'auto_matched', 'manual_matched', 'rejected')),
  freee_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing logs table
CREATE TABLE public.processing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_type TEXT NOT NULL CHECK (process_type IN ('ocr', 'freee_sync', 'matching', 'notification', 'cleanup')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
  details JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER,
  related_receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  related_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_freee_id ON transactions(freee_transaction_id);
CREATE INDEX idx_transactions_matched_receipt ON transactions(matched_receipt_id);
CREATE INDEX idx_transactions_matching_status ON transactions(matching_status);

CREATE INDEX idx_processing_logs_user_id ON processing_logs(user_id);
CREATE INDEX idx_processing_logs_type_status ON processing_logs(process_type, status);
CREATE INDEX idx_processing_logs_created_at ON processing_logs(created_at);
CREATE INDEX idx_processing_logs_related_receipt ON processing_logs(related_receipt_id);

-- Apply updated_at trigger to transactions
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Code Patterns to Follow

- Use DECIMAL for monetary amounts to avoid floating point issues
- Use CHECK constraints for enum-like fields
- Store flexible data in JSONB fields
- Include duration tracking for performance monitoring

### Interface Specifications

- **Input Interfaces**: Requires receipts table from PBI-1-1-2
- **Output Interfaces**: Tables available for matching and reporting

  ```typescript
  interface Transaction {
    id: string;
    user_id: string;
    freee_transaction_id: string | null;
    amount: number;
    date: string;
    description: string;
    category: string | null;
    account_item_id: number | null;
    matched_receipt_id: string | null;
    matching_confidence: number | null;
    matching_status: 'unmatched' | 'auto_matched' | 'manual_matched' | 'rejected';
    freee_data: Record<string, any> | null;
    created_at: string;
    updated_at: string;
  }

  interface ProcessingLog {
    id: string;
    user_id: string;
    process_type: 'ocr' | 'freee_sync' | 'matching' | 'notification' | 'cleanup';
    status: 'started' | 'completed' | 'failed' | 'cancelled';
    details: Record<string, any>;
    error_message: string | null;
    duration_ms: number | null;
    related_receipt_id: string | null;
    related_transaction_id: string | null;
    created_at: string;
  }
  ```

## Acceptance Criteria

- [ ] transactions table is created with proper constraints
- [ ] processing_logs table is created with enum checks
- [ ] All foreign key relationships work correctly
- [ ] Indexes are properly configured for query performance
- [ ] CHECK constraints validate enum values
- [ ] TypeScript types match database schema exactly

## Dependencies

- **Required**: PBI-1-1-2 - Core tables (receipts table for foreign key)

## Testing Requirements

- Unit tests: Test TypeScript types compilation
- Integration tests: Test table creation and foreign key constraints
- Test data: Sample transactions and processing logs

## Estimate

1 story point

## Priority

High - Transaction data structure needed for freee integration

## Implementation Notes

- Use DECIMAL type for amounts to ensure precision
- Store original freee API response in freee_data JSONB field
- Include performance monitoring fields (duration_ms)
- Test cascade behavior when users or receipts are deleted
