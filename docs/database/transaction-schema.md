# Transaction Tables Schema Documentation

## Overview

This document describes the transaction-related database tables implemented in PBI-1-1-3. These tables handle freee API
integration, receipt-transaction matching, and system operation logging.

## Tables

### transactions

Stores transaction data from freee API and manages receipt matching relationships.

| Column               | Type           | Constraints                             | Description                       |
| -------------------- | -------------- | --------------------------------------- | --------------------------------- |
| id                   | UUID           | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique transaction ID             |
| user_id              | UUID           | NOT NULL, FK auth.users(id) CASCADE     | User who owns this transaction    |
| freee_transaction_id | TEXT           | UNIQUE                                  | Unique identifier from freee API  |
| amount               | DECIMAL(10, 2) | NOT NULL                                | Transaction amount with precision |
| date                 | DATE           | NOT NULL                                | Transaction date                  |
| description          | TEXT           | NOT NULL                                | Transaction description           |
| category             | TEXT           |                                         | Transaction category              |
| account_item_id      | INTEGER        |                                         | freee account item ID             |
| matched_receipt_id   | UUID           | FK receipts(id) SET NULL                | Associated receipt (if matched)   |
| matching_confidence  | DECIMAL(3, 2)  | CHECK (0 <= value <= 1)                 | Auto-matching confidence score    |
| matching_status      | TEXT           | DEFAULT 'unmatched', CHECK              | Current matching status           |
| freee_data           | JSONB          |                                         | Original freee API response       |
| created_at           | TIMESTAMPTZ    | DEFAULT NOW()                           | Record creation timestamp         |
| updated_at           | TIMESTAMPTZ    | DEFAULT NOW()                           | Record last update timestamp      |

#### Matching Status Values

- `unmatched`: No receipt matched to this transaction
- `auto_matched`: Automatically matched by the system
- `manual_matched`: Manually matched by the user
- `rejected`: User rejected automatic matching suggestion

### processing_logs

Tracks system operations for debugging and monitoring purposes.

| Column                 | Type        | Constraints                             | Description                         |
| ---------------------- | ----------- | --------------------------------------- | ----------------------------------- |
| id                     | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique log entry ID                 |
| user_id                | UUID        | NOT NULL, FK auth.users(id) CASCADE     | User associated with operation      |
| process_type           | TEXT        | NOT NULL, CHECK IN (...)                | Type of process being logged        |
| status                 | TEXT        | NOT NULL, CHECK IN (...)                | Current status of the process       |
| details                | JSONB       | DEFAULT '{}'                            | Additional process-specific data    |
| error_message          | TEXT        |                                         | Error message if process failed     |
| duration_ms            | INTEGER     |                                         | Process duration in milliseconds    |
| related_receipt_id     | UUID        | FK receipts(id) SET NULL                | Related receipt (if applicable)     |
| related_transaction_id | UUID        | FK transactions(id) SET NULL            | Related transaction (if applicable) |
| created_at             | TIMESTAMPTZ | DEFAULT NOW()                           | Log entry creation timestamp        |

#### Process Type Values

- `ocr`: OCR processing of receipt images
- `freee_sync`: Synchronization with freee API
- `matching`: Receipt-transaction matching operations
- `notification`: Email/notification sending
- `cleanup`: Data cleanup and maintenance operations

#### Process Status Values

- `started`: Process has been initiated
- `completed`: Process finished successfully
- `failed`: Process encountered an error
- `cancelled`: Process was cancelled by user or system

## Indexes

### transactions table

- `idx_transactions_user_id`: Fast user-based queries
- `idx_transactions_date`: Date range filtering for reports
- `idx_transactions_freee_id`: freee API synchronization (partial index)
- `idx_transactions_matched_receipt`: Receipt matching queries (partial index)
- `idx_transactions_matching_status`: Status-based filtering

### processing_logs table

- `idx_processing_logs_user_id`: User-specific log queries
- `idx_processing_logs_type_status`: Process monitoring and filtering
- `idx_processing_logs_created_at`: Time-based log retrieval
- `idx_processing_logs_related_receipt`: Receipt-related log queries (partial index)
- `idx_processing_logs_related_transaction`: Transaction-related log queries (partial index)

## Security

### Row Level Security (RLS)

Both tables implement RLS policies ensuring users can only access their own data:

#### transactions table policies

- `Users can view own transactions`: SELECT for own records
- `Users can insert own transactions`: INSERT with user_id validation
- `Users can update own transactions`: UPDATE for own records
- `Users can delete own transactions`: DELETE for own records

#### processing_logs table policies

- `Users can view own processing logs`: SELECT for own records
- `Users can insert own processing logs`: INSERT with user_id validation

Note: Processing logs are typically append-only, so UPDATE/DELETE policies are not implemented.

## Performance Considerations

### Indexing Strategy

- Partial indexes on nullable foreign keys to save space
- Composite indexes for common query patterns
- Time-based indexes for log data archival

### Query Optimization

- Use prepared statements for repeated queries
- Leverage JSONB operators for flexible data queries
- Consider partitioning for high-volume processing logs

## Data Integrity

### Foreign Key Constraints

- CASCADE deletion for user-owned data
- SET NULL for optional relationships to prevent orphaned records

### Check Constraints

- Enum validation for status fields
- Range validation for confidence scores
- Data type validation at database level

## Usage Examples

### Common Queries

```sql
-- Get unmatched transactions for a user
SELECT * FROM transactions
WHERE user_id = $1 AND matching_status = 'unmatched'
ORDER BY date DESC;

-- Get processing logs for failed operations
SELECT * FROM processing_logs
WHERE user_id = $1 AND status = 'failed'
ORDER BY created_at DESC;

-- Get transactions with high confidence auto-matching
SELECT * FROM transactions
WHERE user_id = $1
  AND matching_status = 'auto_matched'
  AND matching_confidence > 0.8;
```

### JSON Data Examples

```sql
-- Store freee API response
INSERT INTO transactions (user_id, freee_data, ...)
VALUES ($1, '{"api_version": "v1", "sync_time": "2024-01-01T00:00:00Z"}', ...);

-- Store processing details
INSERT INTO processing_logs (user_id, process_type, details, ...)
VALUES ($1, 'ocr', '{"confidence": 0.95, "text_lines": 15}', ...);
```

## Migration Notes

- Migration file: `supabase/migrations/002_transaction_tables.sql`
- Depends on: `001_core_tables.sql` (for receipts table)
- Auto-generated UUID primary keys
- Timestamp triggers for updated_at columns

## Related Documentation

- [Core Schema Documentation](./core-schema.md)
- [API Integration Guide](../api/)
- [Security Guidelines](../ops/operational-guidelines.md)
