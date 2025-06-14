# PBI-1-1-2: Core Tables Creation

## Description

Create the core database tables for user settings and receipts in the PostgreSQL
database. This includes the user_settings table (extending Supabase auth) and the
receipts table for storing receipt information and OCR data.

## Implementation Details

### Files to Create/Modify

1. `supabase/migrations/001_core_tables.sql` - Core tables creation
2. `src/types/database/core.ts` - TypeScript types for core tables
3. `docs/database/core-schema.md` - Core tables documentation

### Technical Requirements

- Use PostgreSQL 14+ features
- Enable UUID extension for primary keys
- Set up proper indexes for performance
- Use proper foreign key constraints
- Include audit fields (created_at, updated_at)

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  freee_company_id TEXT,
  notification_email TEXT,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts table
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  ocr_text TEXT,
  ocr_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_settings_freee_company ON user_settings(freee_company_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Code Patterns to Follow

- Use UUID for all primary keys
- Include proper CASCADE delete behavior
- Use CHECK constraints for enum-like fields
- Implement updated_at triggers for audit trails

### Interface Specifications

- **Output Interfaces**: Tables available for other PBIs

  ```typescript
  interface UserSettings {
    id: string;
    freee_company_id: string | null;
    notification_email: string | null;
    notification_preferences: Record<string, any>;
    created_at: string;
    updated_at: string;
  }

  interface Receipt {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    ocr_text: string | null;
    ocr_data: Record<string, any> | null;
    processed_at: string | null;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
    updated_at: string;
  }
  ```

## Acceptance Criteria

- [ ] user_settings table is created with proper foreign key to auth.users
- [ ] receipts table is created with all required fields
- [ ] All tables have proper indexes for performance
- [ ] CHECK constraints are working for status field
- [ ] Updated_at triggers are functioning correctly
- [ ] TypeScript types match database schema exactly

## Dependencies

- **Required**: PBI-1-1-1 - Supabase project must be initialized

### Handover Items from PBI-1-1-1

#### Critical Security Requirements
- [ ] **RLS Implementation**: All new tables MUST have Row Level Security enabled with default DENY policies
- [ ] **Service Role Key Protection**: SUPABASE_SERVICE_ROLE_KEY must NEVER be used client-side
- [ ] **Migration Templates**: Create RLS-enabled migration templates for future development

#### Infrastructure Setup Required
- [ ] **Dependencies Installation**: Install @supabase/supabase-js and required Node.js packages
- [ ] **Server Client Separation**: Create `src/lib/supabase/server-client.ts` for server-side operations
- [ ] **Type Generation**: Add `npm run supabase:types` script for automatic type generation
- [ ] **Connection Testing**: Move `test-supabase-connection.js` → `scripts/test-connection.ts` (TypeScript)

#### Quality Assurance Setup
- [ ] **RLS Validation**: Create automated RLS check scripts
- [ ] **PR Templates**: Update pull request templates with RLS verification checklist
- [ ] **Security Documentation**: Document RLS policies and security patterns

## Testing Requirements

- Unit tests: Test TypeScript types compilation
- Integration tests: Test table creation and basic CRUD operations
- Test data: Sample user settings and receipt records

## Estimate

1 story point

## Priority

High - Core tables needed by all receipt processing features

## Implementation Notes

- Use Supabase migration system for version control
- Test foreign key constraints with sample data
- Ensure proper timezone handling for timestamps
- Document field purposes in schema documentation
