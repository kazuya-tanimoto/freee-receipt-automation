# Core Database Schema

## Overview

This document describes the core database tables created in PBI-1-1-2 for the freee Receipt Automation system.
These tables form the foundation for user settings management and receipt processing.

## Tables

### user_settings

Extends Supabase's `auth.users` table with application-specific user settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | User ID from Supabase auth |
| `freee_company_id` | TEXT | NULL | freee company ID for integration |
| `notification_email` | TEXT | NULL | Email address for notifications |
| `notification_preferences` | JSONB | DEFAULT '{}' | JSON object containing notification preferences |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**

- `idx_user_settings_freee_company` on `freee_company_id`

**Triggers:**

- `update_user_settings_updated_at` - Auto-updates `updated_at` on record modification

**Row Level Security (RLS):**

- Users can only access their own settings records
- Policies: SELECT, INSERT, UPDATE for own records only

### receipts

Stores receipt files and OCR processing results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY DEFAULT uuid_generate_v4() | Unique receipt identifier |
| `user_id` | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Owner of the receipt |
| `file_name` | TEXT | NOT NULL | Original filename of uploaded receipt |
| `file_path` | TEXT | NOT NULL | Storage path to the receipt file |
| `file_size` | INTEGER | NULL | File size in bytes |
| `mime_type` | TEXT | NULL | MIME type of the file |
| `ocr_text` | TEXT | NULL | Raw OCR text extracted from receipt |
| `ocr_data` | JSONB | NULL | Structured OCR data as JSON |
| `processed_at` | TIMESTAMP WITH TIME ZONE | NULL | When OCR processing completed |
| `status` | TEXT | DEFAULT 'pending', CHECK status IN (...) | Processing status |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**

- `idx_receipts_user_id` on `user_id`
- `idx_receipts_status` on `status`
- `idx_receipts_created_at` on `created_at`

**Triggers:**

- `update_receipts_updated_at` - Auto-updates `updated_at` on record modification

**Row Level Security (RLS):**

- Users can only access their own receipt records
- Policies: SELECT, INSERT, UPDATE, DELETE for own records only

## Database Functions

### update_updated_at_column()

A trigger function that automatically updates the `updated_at` column whenever a record is modified.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with default DENY policies. Users can only access their own data:

- **user_settings**: Users can view, insert, and update only their own settings
- **receipts**: Users can view, insert, update, and delete only their own receipts

### Data Isolation

- Foreign key constraints ensure data integrity
- CASCADE deletes prevent orphaned records when users are deleted
- UUID primary keys provide non-predictable identifiers

## Performance Considerations

### Indexing Strategy

- **User-based queries**: Indexed on `user_id` for efficient user data retrieval
- **Status filtering**: Indexed on `status` for processing queue management
- **Time-based queries**: Indexed on `created_at` for chronological sorting
- **Company integration**: Indexed on `freee_company_id` for integration queries

### Query Patterns

Typical query patterns these indexes support:

```sql
-- User's receipts by status
SELECT * FROM receipts WHERE user_id = $1 AND status = 'pending';

-- Recent receipts for user
SELECT * FROM receipts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10;

-- User settings by company
SELECT * FROM user_settings WHERE freee_company_id = $1;
```

## Migration Information

- **Migration File**: `supabase/migrations/001_core_tables.sql`
- **Dependencies**: Requires Supabase project initialization (PBI-1-1-1)
- **Features Used**: PostgreSQL 14+, UUID extension, JSONB, RLS, triggers

## TypeScript Integration

TypeScript interfaces are defined in `src/types/database/core.ts` and match the database schema exactly.

## Future Considerations

These core tables are designed to be extended by:

- Transaction matching tables (PBI-1-1-3)
- Additional user preference fields
- Enhanced OCR data structures
- Audit logging extensions
