# PBI Template for AI-Driven Development

## Overview

This template defines the standard format for Product Backlog Items (PBIs) optimized for AI-driven development. Each PBI
should be implementable in a single AI session.

## Template Structure

`````markdown
# PBI-[Phase]-[Major]-[Minor]: [Title]

## Description

[Brief description of what needs to be implemented - 2-3 sentences]

## Implementation Details

### Files to Create/Modify

1. `path/to/file1.ts` - [Description of changes]
2. `path/to/file2.tsx` - [Description of changes]

### Technical Requirements

- [Specific technical requirement 1]
- [Specific technical requirement 2]

### API Endpoints (if applicable)

- `POST /api/endpoint` - [Description]
  - Request body: `{ field1: string, field2: number }`
  - Response: `{ id: string, status: string }`

### Database Schema (if applicable)

```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field1 TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Environment Variables (if applicable)

- `VARIABLE_NAME` - [Description and example value]

### Code Patterns to Follow

- Use [specific pattern] for [specific functionality]
- Follow [architecture pattern] for [component type]

### Interface Specifications (if applicable)

- **Input Interfaces**: Define exact data structures this PBI expects

  ```typescript
  interface InputData {
    field1: string;
    field2: number;
  }
  ```

- **Output Interfaces**: Define what this PBI provides to other PBIs

  ```typescript
  interface OutputData {
    result: string;
    status: 'success' | 'error';
  }
  ```

- **Service Contracts**: Define function signatures and behaviors
  ```typescript
  interface ServiceContract {
    methodName(param: Type): Promise<ReturnType>;
  }
  ```

## Metadata

- **Status**: [Not Started/In Progress/Completed/Blocked]
- **Actual Story Points**: [To be filled after completion]
- **Created**: [Date]
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria

- [ ] [Specific, measurable criterion 1]
- [ ] [Specific, measurable criterion 2]
- [ ] [Specific, measurable criterion 3]

### Verification Commands

```bash
# Commands to verify implementation
npm run test:unit
npm run build
# Add specific verification steps here
```

## Dependencies

- **Required**: PBI-X-X-X - [Specific interface/data structure needed]
- **Optional**: PBI-Y-Y-Y - [Nice to have but not blocking]

## Testing Requirements

- Unit tests: [Specific test scenarios]
- Integration tests: [Specific integration points]
- Test data: [Required test data structure]

## Estimate

[1-2] story points

## Priority

[High/Medium/Low] - [Justification]

## Implementation Notes

- [Any specific considerations for AI implementation]
- [Common pitfalls to avoid]
- [Reference to similar implementations]

````text

## Guidelines for Using This Template

### 1. Granularity
- Each PBI should be 1-2 story points maximum
- If larger, break down into sub-tasks

### 2. Specificity
- Include exact file paths
- Provide concrete code examples
- Define clear interfaces

### 3. Dependencies
- Specify exact data structures needed
- Reference specific APIs or services
- Include version requirements

### 4. Testing
- Define specific test scenarios
- Include test data structures
- Specify coverage requirements

### 5. AI-Friendly Format
- Use clear, unambiguous language
- Provide examples where helpful
- Include reference implementations

## Example Usage

```markdown
# PBI-1-1-1: Initialize Supabase Project

## Description
Create a new Supabase project with initial configuration for the freee receipt automation system.

## Implementation Details

### Files to Create/Modify
1. `supabase/config.toml` - Supabase project configuration
2. `.env.local` - Environment variables for local development
3. `src/lib/supabase.ts` - Supabase client initialization

### Technical Requirements
- Use Supabase CLI v1.0+
- Configure project for Japan region
- Enable email authentication

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

### Code Patterns to Follow
- Use singleton pattern for Supabase client
- Implement proper TypeScript types for all database tables

## Acceptance Criteria
- [ ] Supabase project is created and accessible
- [ ] Environment variables are properly configured
- [ ] Supabase client can connect successfully
- [ ] TypeScript types are generated from database schema

## Dependencies
- **Required**: None (first task)

## Testing Requirements
- Unit tests: Test Supabase client initialization
- Integration tests: Test connection to Supabase

## Estimate
1 story point

## Priority
High - Foundational task required by all other features
````
`````
