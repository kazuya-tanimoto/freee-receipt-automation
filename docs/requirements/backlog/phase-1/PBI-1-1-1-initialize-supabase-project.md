# PBI-1-1-1: Initialize Supabase Project

## Description

Create a new Supabase project with initial configuration for the freee receipt automation system. This includes setting
up the project via Supabase CLI and configuring basic settings.

## Implementation Details

### Files to Create/Modify

1. `supabase/config.toml` - Supabase project configuration
2. `.env.local` - Environment variables for local development
3. `.env.example` - Example environment variables for documentation
4. `src/lib/supabase/client.ts` - Supabase client initialization
5. `src/types/supabase.ts` - TypeScript types for Supabase

### Technical Requirements

- Use Supabase CLI v1.0+
- Configure project for Japan region (ap-northeast-1)
- Enable email authentication
- Set up proper CORS configuration
- Configure rate limiting

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

### Code Patterns to Follow

- Use singleton pattern for Supabase client
- Implement separate clients for browser and server contexts
- Use environment variable validation

## Acceptance Criteria

- [ ] Supabase project is created and accessible
- [ ] Environment variables are properly configured
- [ ] Supabase client can connect successfully
- [ ] Basic authentication is enabled
- [ ] CORS is properly configured for Next.js app

## Dependencies

- **Required**: None (first task)

## Testing Requirements

- Unit tests: Test Supabase client initialization
- Integration tests: Test connection to Supabase
- Test data: Basic test user credentials

## Estimate

1 story point

## Priority

High - Foundational task required by all other features

## Implementation Notes

- Use `npx supabase init` to initialize the project
- Ensure to use the free tier settings initially
- Document the project URL and keys securely
