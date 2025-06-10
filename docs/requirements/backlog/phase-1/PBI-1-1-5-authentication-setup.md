# PBI-1-1-5: Authentication Setup

## Description

Configure authentication system for the freee receipt automation application. This
includes setting up email/password authentication, creating auth helper functions,
and implementing session management with Next.js middleware.

## Implementation Details

### Files to Create/Modify

1. `src/lib/auth/index.ts` - Authentication helper functions
2. `src/middleware.ts` - Next.js middleware for protected routes
3. `src/lib/auth/session.ts` - Session management utilities
4. `src/components/auth/AuthProvider.tsx` - React context for auth state
5. `src/hooks/useAuth.ts` - Custom hook for authentication

### Technical Requirements

- Configure email/password authentication in Supabase
- Implement JWT token refresh mechanism
- Set up protected route middleware
- Configure session expiry (7 days)
- Implement proper error handling

### API Endpoints

- `POST /api/auth/login` - User login
  - Request body: `{ email: string, password: string }`
  - Response: `{ user: User, session: Session }`
- `POST /api/auth/logout` - User logout
  - Response: `{ success: boolean }`
- `POST /api/auth/refresh` - Refresh session
  - Response: `{ session: Session }`

### Code Patterns to Follow

- Use React Context for auth state management
- Implement middleware pattern for route protection
- Use proper TypeScript types for user and session
- Follow Next.js App Router conventions

## Acceptance Criteria

- [ ] Users can sign up with email/password
- [ ] Users can log in and receive a session
- [ ] Protected routes redirect to login when unauthorized
- [ ] Session persists across browser refreshes
- [ ] Logout properly clears session

## Dependencies

- **Required**: PBI-1-1-1 - Supabase project must be initialized
- **Required**: PBI-1-1-2 - User settings table must exist

## Testing Requirements

- Unit tests: Test auth helper functions
- Integration tests: Test login/logout flow
- Test data: Test user accounts with different roles

## Estimate

1 story point

## Priority

High - Core authentication needed for all user features

## Implementation Notes

- Use Supabase Auth hooks for React components
- Implement proper PKCE flow for security
- Consider implementing social auth in future phase
