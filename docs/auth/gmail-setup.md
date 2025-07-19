# Gmail OAuth Setup Guide

This guide explains how to set up and configure Gmail OAuth2.0 authentication for the freee Receipt Automation application.

## Overview

The Gmail OAuth integration allows users to securely connect their Gmail accounts to automatically process
receipt emails. The implementation uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for enhanced
security.

## Prerequisites

- Google Cloud Console project
- Gmail API enabled
- OAuth 2.0 credentials configured
- Required environment variables set

## Google Cloud Console Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID for later use

### 2. Enable Gmail API

1. Navigate to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click "Enable" to activate the Gmail API for your project

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (for testing) or **Internal** (for organization users)
3. Fill in the required information:
   - App name: "freee Receipt Automation"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (if using External type)

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as application type
4. Configure:
   - Name: "freee Receipt Automation"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/gmail/callback` (for development)
     - `https://your-domain.com/api/auth/gmail/callback` (for production)
5. Download the credentials JSON file

## Environment Configuration

Add the following environment variables to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_here

# OAuth Encryption Key (generate a random 32-character string)
OAUTH_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## Implementation Architecture

### OAuth Flow Components

1. **Authorization Endpoint** (`/api/auth/gmail/authorize`)
   - Initiates OAuth flow
   - Generates PKCE parameters
   - Returns Google authorization URL

2. **Callback Endpoint** (`/api/auth/gmail/callback`)
   - Handles OAuth callback
   - Exchanges authorization code for tokens
   - Stores tokens securely in Supabase

3. **Gmail Connect Component** (`GmailConnect.tsx`)
   - User interface for Gmail connection
   - Displays connection status
   - Handles connect/disconnect actions

### Security Features

- **PKCE (Proof Key for Code Exchange)**: Prevents authorization code interception
- **State Parameter**: CSRF protection
- **Token Encryption**: Tokens stored encrypted in Supabase user metadata
- **Automatic Token Refresh**: Handles token expiration transparently
- **Secure Storage**: Uses Supabase Admin API for token management

## Usage

### Frontend Integration

```tsx
import { GmailConnect } from '@/components/auth/GmailConnect'

function DashboardPage() {
  return (
    <div>
      <h1>Settings</h1>
      <GmailConnect />
    </div>
  )
}
```

### Backend Integration

```typescript
import { getValidAccessToken } from '@/lib/oauth/common-oauth'
import { getGmailClientInstance } from '@/lib/gmail/gmail-client'

async function getGmailClient(userId: string) {
  // Get valid access token (auto-refreshes if needed)
  const accessToken = await getValidAccessToken(userId, 'google')
  
  // Create OAuth2 client
  const oauth2Client = new OAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  
  // Create Gmail client
  return getGmailClientInstance(oauth2Client)
}
```

## API Endpoints

### GET /api/auth/gmail/authorize

Initiates Gmail OAuth flow.

**Query Parameters:**

- `redirect_uri` (optional): Custom redirect URI

**Response:**

```json
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth...",
  "state": "random_state_string"
}
```

### GET /api/auth/gmail/callback

Handles OAuth callback from Google.

**Query Parameters:**

- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection
- `code_verifier`: PKCE code verifier

**Redirects:**

- Success: `/dashboard?gmail_connected=true`
- Error: `/dashboard?error=error_message`

## Error Handling

Common error scenarios and their handling:

### 1. Invalid Credentials

- **Cause**: Incorrect client ID/secret
- **Solution**: Verify environment variables
- **Response**: 401 Unauthorized

### 2. Scope Insufficient

- **Cause**: Missing required OAuth scopes
- **Solution**: Update OAuth consent screen configuration
- **Response**: 403 Forbidden

### 3. Token Expired

- **Cause**: Access token has expired
- **Solution**: Automatic refresh using refresh token
- **Fallback**: Re-authenticate if refresh token invalid

### 4. Rate Limiting

- **Cause**: Too many API requests
- **Solution**: Implement exponential backoff retry
- **Response**: 429 Too Many Requests

## Testing

### Unit Tests

```bash
# Test OAuth flow
yarn test src/lib/oauth/common-oauth.test.ts

# Test Gmail authentication
yarn test src/lib/gmail/gmail-auth.test.ts

# Test API endpoints
yarn test src/app/api/auth/gmail
```

### Integration Tests

```bash
# Test complete OAuth flow
yarn test:integration -- --grep "Gmail OAuth"
```

### Manual Testing

1. Start development server: `yarn dev`
2. Navigate to the dashboard
3. Click "Connect Gmail" button
4. Complete OAuth flow in browser
5. Verify connection status updates

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"invalid_client" Error**
   - Verify `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`
   - Ensure credentials are for the correct Google Cloud project

3. **"insufficient_scope" Error**
   - Check OAuth consent screen scopes
   - Ensure Gmail API is enabled

4. **Token Storage Issues**
   - Verify `OAUTH_ENCRYPTION_KEY` is set
   - Check Supabase service role key permissions

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=oauth:*
```

## Security Considerations

1. **Environment Variables**: Never commit credentials to version control
2. **HTTPS**: Always use HTTPS in production
3. **Token Rotation**: Tokens are automatically refreshed
4. **Scope Limitation**: Only request necessary permissions
5. **Audit Logging**: Monitor OAuth token usage

## Monitoring

Monitor OAuth usage through:

1. **Supabase Dashboard**: User authentication events
2. **Google Cloud Console**: API usage quotas
3. **Application Logs**: OAuth flow success/failure rates

## Related Documentation

- [OAuth Flows](../api/oauth-flows.md)
- [Authentication](../api/authentication.md)
- [Error Handling](../api/error-handling.md)
- [Gmail API Operations](../../docs/requirements/backlog/phase-2/PBI-2-2-2-gmail-basic-api-operations.md)
