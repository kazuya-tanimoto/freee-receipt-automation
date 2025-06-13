# PBI-2-1-2: Common OAuth Module

## Description

Create a reusable OAuth 2.0 authentication module that handles authentication flows
for multiple external services (Gmail, Google Drive, freee API). This provides
consistent authentication patterns and reduces code duplication across different
API integrations.

## Implementation Details

### Files to Create/Modify

1. `src/lib/oauth/index.ts` - Main OAuth module exports
2. `src/lib/oauth/providers.ts` - OAuth provider configurations
3. `src/lib/oauth/client.ts` - OAuth client implementation
4. `src/lib/oauth/token-manager.ts` - Token storage and refresh logic
5. `src/lib/oauth/types.ts` - OAuth-related TypeScript types
6. `src/lib/oauth/errors.ts` - OAuth error handling
7. `docs/auth/oauth-guide.md` - OAuth implementation guide

### Technical Requirements

- Support OAuth 2.0 Authorization Code flow with PKCE
- Implement automatic token refresh mechanism
- Secure token storage using Supabase
- Support multiple OAuth providers (Google, freee)
- Include comprehensive error handling

### OAuth Providers Configuration

```typescript
interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  redirectUri: string;
}

const providers: Record<string, OAuthProvider> = {
  google: {
    name: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/drive.file",
    ],
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
  },
  freee: {
    name: "freee",
    authUrl: "https://accounts.secure.freee.co.jp/public_api/authorize",
    tokenUrl: "https://accounts.secure.freee.co.jp/public_api/token",
    scopes: ["read", "write"],
    clientId: process.env.FREEE_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/freee`,
  },
};
```

### Database Schema Addition

```sql
-- OAuth tokens table
CREATE TABLE public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'freee')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);
```

### Code Patterns to Follow

- Use factory pattern for provider-specific clients
- Implement singleton pattern for token manager
- Use TypeScript generics for type safety
- Follow secure coding practices for token handling

### Interface Specifications

- **Input Interfaces**: Requires user authentication from PBI-1-1-3
- **Output Interfaces**: Provides OAuth services for external API integrations

  ```typescript
  interface OAuthClient {
    getAuthUrl(state?: string): string;
    exchangeCodeForTokens(code: string, state?: string): Promise<TokenResponse>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;
    revokeToken(token: string): Promise<void>;
  }

  interface TokenManager {
    storeTokens(
      userId: string,
      provider: string,
      tokens: TokenResponse,
    ): Promise<void>;
    getValidToken(userId: string, provider: string): Promise<string | null>;
    refreshTokenIfNeeded(
      userId: string,
      provider: string,
    ): Promise<string | null>;
    revokeTokens(userId: string, provider: string): Promise<void>;
  }

  interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
  }
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

- [ ] OAuth clients for Google and freee are implemented
- [ ] Token storage and retrieval from Supabase works correctly
- [ ] Automatic token refresh is functional
- [ ] PKCE flow is properly implemented for security
- [ ] Error handling covers all OAuth failure scenarios
- [ ] OAuth tokens table is created with proper constraints

### Verification Commands

```bash
# Test OAuth module compilation
npm run type-check
# Test OAuth flow with mock providers
npm run test:oauth
# Verify database migration
npx supabase db reset --local
```

## Dependencies

- **Required**: PBI-1-1-2-A - Core tables for user_id foreign key
- **Required**: PBI-1-1-3 - Authentication setup for user context

## Testing Requirements

- Unit tests: Test OAuth client methods and token management
- Integration tests: Test OAuth flow with sandbox environments
- Test data: Mock OAuth responses and test credentials

## Estimate

1 story point

## Priority

High - Common authentication needed by all external API integrations

## Implementation Notes

- Use crypto.randomUUID() for PKCE code verifier generation
- Implement proper token encryption before database storage
- Add logging for OAuth events (without exposing tokens)
- Consider implementing OAuth state parameter validation
- Test with actual OAuth providers in development environment
