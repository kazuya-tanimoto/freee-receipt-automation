# PBI-3-1-2: Supabase Client Integration and Authentication Setup

## Description

Configure Supabase client for browser and server-side operations with cookie-based authentication. Set up TypeScript
types and environment configuration for secure database access.

## Implementation Details

### Files to Create/Modify

1. `src/lib/supabase/client.ts` - Browser Supabase client configuration
2. `src/lib/supabase/server.ts` - Server-side Supabase client
3. `src/lib/supabase/middleware.ts` - Authentication middleware logic
4. `middleware.ts` - NextJS middleware for route protection
5. `src/types/database.ts` - Auto-generated database types
6. `.env.local.example` - Environment variables template

### Technical Requirements

- Supabase client v2 with SSR support
- Cookie-based authentication for NextJS App Router
- Auto-generated TypeScript types from database schema
- Secure environment variable handling
- Route protection middleware

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

### Code Patterns to Follow

- Use separate clients for browser and server operations
- Implement proper error handling for connection issues
- Follow Supabase SSR authentication patterns
- Use TypeScript strict types for all database operations

### Architecture and State Management

- Implement React Query for server state caching
- Use Zustand for client-side authentication state
- Configure React Query with optimistic updates
- Implement proper cache invalidation strategies

### API Integration Specifications

```typescript
// Database client configuration
interface DatabaseClient {
  url: string;
  anonKey: string;
  cookieOptions: {
    name: string;
    domain?: string;
    sameSite: 'lax' | 'strict' | 'none';
  };
}

// Authentication state interface
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}
```

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant
- **Reviewer**: Human Developer

## Acceptance Criteria

- [ ] Supabase client connects successfully to database
- [ ] Authentication middleware protects routes correctly
- [ ] TypeScript types are generated from database schema
- [ ] Environment variables are properly configured
- [ ] Session management works with cookies
- [ ] Server and client operations work independently

### Verification Commands

```bash
npm run type-check
npm run test:connection
npm run dev
```

## Dependencies

- **Required**: PBI-3-1-1 - NextJS project setup
- **Required**: Phase 1 completion - Supabase database schema

### Security Considerations

- Row Level Security (RLS) policy validation
- CSRF token integration for state-changing operations
- Secure cookie configuration with httpOnly flags
- Environment variable validation and sanitization

### Performance Optimizations

- Connection pooling for server-side operations
- Query result caching with React Query
- Optimistic updates for real-time user experience
- Connection retry logic with exponential backoff

## Testing Requirements

- Unit Tests (Vitest): Client configuration, error handling, type safety
- Integration Tests (Testing Library): Authentication flows, session management
- E2E Tests (Playwright): Complete auth flows, route protection
- Security Tests: RLS policies, CSRF protection, cookie security

### Test Coverage Requirements

- Client initialization: 100%
- Authentication flows: 100%
- Error scenarios: 90%
- Security features: 100%

## Estimate

1 story point

## Priority

High - Required for all data operations and authentication

## Implementation Notes

- Configure clients for both browser and server environments
- Ensure proper cookie handling for SSR authentication
- Generate and maintain TypeScript types for database schema
- Implement secure environment variable validation
