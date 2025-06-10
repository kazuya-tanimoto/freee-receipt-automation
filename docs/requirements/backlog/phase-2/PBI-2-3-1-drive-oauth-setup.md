# PBI-2-3-1: Google Drive OAuth Setup

## Description

Configure Google Drive API OAuth 2.0 authentication using the common OAuth module.
This establishes secure access to Google Drive API for file storage and organization
with appropriate scopes and permissions.

## Implementation Details

### Files to Create/Modify

1. `src/lib/drive/auth.ts` - Drive-specific OAuth configuration
2. `src/lib/drive/client.ts` - Drive API client factory
3. `src/pages/api/auth/drive/authorize.ts` - OAuth authorization endpoint
4. `src/pages/api/auth/drive/callback.ts` - OAuth callback handler
5. `src/components/auth/DriveConnect.tsx` - Drive connection UI component
6. `docs/auth/drive-setup.md` - Google Drive API setup guide

### Technical Requirements

- Use Google OAuth 2.0 with PKCE flow
- Request minimal required scopes for file management
- Implement secure token storage via common OAuth module
- Handle OAuth errors and edge cases
- Support token refresh for long-lived access

### Drive-specific OAuth Configuration

```typescript
import { OAuthClient } from "@/lib/oauth";

const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

export class DriveOAuthClient extends OAuthClient {
  constructor() {
    super("google", {
      scopes: DRIVE_SCOPES,
      additionalParams: {
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
      },
    });
  }

  async getDriveClient(userId: string): Promise<drive_v3.Drive | null> {
    const token = await this.tokenManager.getValidToken(userId, "google");
    if (!token) return null;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    return google.drive({ version: "v3", auth });
  }

  async hasRequiredScopes(userId: string): Promise<boolean> {
    const tokenInfo = await this.tokenManager.getTokenInfo(userId, "google");
    if (!tokenInfo?.scopes) return false;

    return DRIVE_SCOPES.every((scope) => tokenInfo.scopes.includes(scope));
  }
}
```

### API Endpoints

```typescript
// POST /api/auth/drive/authorize
interface DriveAuthorizeRequest {
  userId: string;
  requestedScopes?: string[];
}

interface DriveAuthorizeResponse {
  authUrl: string;
  state: string;
  scopesRequested: string[];
}

// GET /api/auth/drive/callback?code=...&state=...
interface DriveCallbackResponse {
  success: boolean;
  error?: string;
  grantedScopes: string[];
  redirectUrl: string;
}

// GET /api/auth/drive/status
interface DriveStatusResponse {
  isConnected: boolean;
  scopes: string[];
  expiresAt?: string;
  quotaInfo?: {
    limit: string;
    usage: string;
    usageInDrive: string;
  };
}
```

### Drive Folder Structure Setup

```typescript
export interface FolderStructure {
  receipts: {
    path: "/01.領収書";
    monthly: boolean; // Creates MM/ subfolders
  };
  fixedAssets: {
    path: "/99.固定資産分";
    monthly: false;
  };
}

export class DriveFolderManager {
  constructor(private driveClient: drive_v3.Drive) {}

  async ensureFolderStructure(
    structure: FolderStructure,
  ): Promise<Record<string, string>> {
    const folderIds: Record<string, string> = {};

    for (const [key, config] of Object.entries(structure)) {
      const folderId = await this.ensureFolder(config.path);
      folderIds[key] = folderId;

      if (config.monthly) {
        // Create monthly subfolders (01/, 02/, ... 12/)
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, "0");
          await this.ensureFolder(`${monthStr}/`, folderId);
        }
      }
    }

    return folderIds;
  }

  private async ensureFolder(path: string, parentId?: string): Promise<string> {
    // Implementation for creating/finding folders
  }
}
```

### Environment Variables

```bash
# Google OAuth configuration (shared with Gmail)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/drive/callback

# Drive-specific configuration
DRIVE_ROOT_FOLDER_NAME=freee-receipts
DRIVE_FOLDER_STRUCTURE_CONFIG=path/to/folder-config.json
```

### Code Patterns to Follow

- Use the common OAuth module for consistent authentication
- Implement proper error boundaries for OAuth failures
- Add comprehensive logging for OAuth events
- Follow Google's OAuth 2.0 best practices for Drive API

### Interface Specifications

- **Input Interfaces**: Uses common OAuth module from PBI-2-1-2
- **Output Interfaces**: Provides Drive API access for other PBIs

  ```typescript
  export interface DriveAuthService {
    initiateAuth(
      userId: string,
      scopes?: string[],
    ): Promise<{ authUrl: string; state: string }>;
    handleCallback(code: string, state: string): Promise<void>;
    getAuthenticatedClient(userId: string): Promise<drive_v3.Drive | null>;
    isAuthenticated(userId: string): Promise<boolean>;
    hasRequiredScopes(userId: string): Promise<boolean>;
    revokeAccess(userId: string): Promise<void>;
  }

  export interface DriveTokenInfo {
    hasAccess: boolean;
    expiresAt?: Date;
    scopes: string[];
    quotaInfo?: DriveQuotaInfo;
  }

  export interface DriveQuotaInfo {
    limit: string;
    usage: string;
    usageInDrive: string;
    usageInDriveTrash: string;
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

- [ ] Google Drive OAuth flow initiates correctly from UI
- [ ] OAuth callback properly stores tokens using common module
- [ ] Drive API client can be created with valid tokens
- [ ] Token refresh works automatically when tokens expire
- [ ] OAuth errors are handled gracefully with user feedback
- [ ] Drive connection status and quota info are displayed in UI

### Verification Commands

```bash
# Test Drive OAuth endpoints
npm run test:integration -- --grep "Drive OAuth"
# Check token storage and scopes
npm run test:oauth -- drive
# Verify Drive API client creation
npm run dev && curl http://localhost:3000/api/auth/drive/status
```

## Dependencies

- **Required**: PBI-2-1-2 - Common OAuth module must be implemented
- **Required**: PBI-1-1-3 - User authentication for userId context

## Testing Requirements

- Unit tests: Test Drive OAuth client methods
- Integration tests: Test OAuth flow with Google OAuth playground
- Test data: Mock Drive OAuth responses

## Estimate

1 story point

## Priority

High - Drive authentication required before any file operations

## Implementation Notes

- Use googleapis npm package for Drive API client
- Test OAuth flow in Google OAuth 2.0 Playground first
- Implement proper scope validation to ensure minimal permissions
- Add user-friendly error messages for common OAuth failures
- Consider implementing incremental authorization for additional scopes
- Handle scope combinations carefully (Drive + Gmail scopes)
