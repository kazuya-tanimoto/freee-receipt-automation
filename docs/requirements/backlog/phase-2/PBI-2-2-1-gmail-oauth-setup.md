# PBI-2-2-1: Gmail OAuth Setup

## Description
Configure Gmail API OAuth 2.0 authentication using the common OAuth module. This establishes secure access to Gmail API for reading email receipts with appropriate scopes and permissions.

## Implementation Details

### Files to Create/Modify
1. `src/lib/gmail/auth.ts` - Gmail-specific OAuth configuration
2. `src/lib/gmail/client.ts` - Gmail API client factory
3. `src/pages/api/auth/gmail/authorize.ts` - OAuth authorization endpoint
4. `src/pages/api/auth/gmail/callback.ts` - OAuth callback handler
5. `src/components/auth/GmailConnect.tsx` - Gmail connection UI component
6. `docs/auth/gmail-setup.md` - Gmail API setup guide

### Technical Requirements
- Use Google OAuth 2.0 with PKCE flow
- Request minimal required scopes for email reading
- Implement secure token storage via common OAuth module
- Handle OAuth errors and edge cases
- Support token refresh for long-lived access

### Gmail-specific OAuth Configuration
```typescript
import { OAuthClient } from '@/lib/oauth';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata'
];

export class GmailOAuthClient extends OAuthClient {
  constructor() {
    super('google', {
      scopes: GMAIL_SCOPES,
      additionalParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    });
  }
  
  async getGmailClient(userId: string): Promise<gmail_v1.Gmail | null> {
    const token = await this.tokenManager.getValidToken(userId, 'google');
    if (!token) return null;
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });
    
    return google.gmail({ version: 'v1', auth });
  }
}
```

### API Endpoints
```typescript
// POST /api/auth/gmail/authorize
interface AuthorizeRequest {
  userId: string;
}

interface AuthorizeResponse {
  authUrl: string;
  state: string;
}

// GET /api/auth/gmail/callback?code=...&state=...
interface CallbackResponse {
  success: boolean;
  error?: string;
  redirectUrl: string;
}
```

### Environment Variables
```bash
# Google OAuth configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
```

### Code Patterns to Follow
- Use the common OAuth module for consistent authentication
- Implement proper error boundaries for OAuth failures
- Add comprehensive logging for OAuth events
- Follow Google's OAuth 2.0 best practices

### Interface Specifications
- **Input Interfaces**: Uses common OAuth module from PBI-2-2-2
- **Output Interfaces**: Provides Gmail API access for other PBIs
  ```typescript
  export interface GmailAuthService {
    initiateAuth(userId: string): Promise<{ authUrl: string; state: string }>;
    handleCallback(code: string, state: string): Promise<void>;
    getAuthenticatedClient(userId: string): Promise<gmail_v1.Gmail | null>;
    isAuthenticated(userId: string): Promise<boolean>;
    revokeAccess(userId: string): Promise<void>;
  }
  
  export interface GmailTokenInfo {
    hasAccess: boolean;
    expiresAt?: Date;
    scopes: string[];
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
- [ ] Gmail OAuth flow initiates correctly from UI
- [ ] OAuth callback properly stores tokens using common module
- [ ] Gmail API client can be created with valid tokens
- [ ] Token refresh works automatically when tokens expire
- [ ] OAuth errors are handled gracefully with user feedback
- [ ] Gmail connection status is displayed in user interface

### Verification Commands
```bash
# Test Gmail OAuth endpoints
npm run test:integration -- --grep "Gmail OAuth"
# Check token storage
npm run test:oauth -- gmail
# Verify Gmail API client creation
npm run dev && curl http://localhost:3000/api/auth/gmail/status
```

## Dependencies
- **Required**: PBI-2-1-2 - Common OAuth module must be implemented
- **Required**: PBI-1-1-3 - User authentication for userId context

## Testing Requirements
- Unit tests: Test Gmail OAuth client methods
- Integration tests: Test OAuth flow with Google OAuth playground
- Test data: Mock Gmail OAuth responses

## Estimate
1 story point

## Priority
High - Gmail authentication required before any email processing

## Implementation Notes
- Use googleapis npm package for Gmail API client
- Test OAuth flow in Google OAuth 2.0 Playground first
- Implement proper scope validation to ensure minimal permissions
- Add user-friendly error messages for common OAuth failures
- Consider implementing incremental authorization for additional scopes
