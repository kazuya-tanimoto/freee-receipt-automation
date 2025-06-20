/**
 * Common OAuth2.0 Authentication Module
 * 
 * Provides a unified interface for OAuth2.0 authentication with PKCE support.
 * Integrates with Supabase Auth for secure token storage and management.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import type {
  IOAuthProvider,
  OAuthProvider,
  OAuthInitiateRequest,
  OAuthInitiateResponse,
  OAuthCallbackRequest,
  OAuthTokenResponse,
  OAuthRefreshRequest,
  PKCEParams,
  StoredOAuthTokens,
  OAuthUserInfo,
  OAuthException,
  RateLimitInfo,
  QuotaInfo,
  OAUTH_CONFIG
} from './types';
import { GoogleOAuthProvider } from './providers/google-oauth-provider';

// ============================================================================
// OAuth Manager Class
// ============================================================================

/**
 * Common OAuth manager for handling authentication flows
 */
export class OAuthManager {
  private providers: Map<OAuthProvider, IOAuthProvider> = new Map();
  private pkceStorage: Map<string, PKCEParams> = new Map();
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  constructor() {
    this.initializeProviders();
    this.startCleanupInterval();
  }

  /**
   * Initialize OAuth providers
   */
  private initializeProviders(): void {
    // Register Google OAuth provider
    const googleProvider = new GoogleOAuthProvider({
      name: 'google',
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      defaultScopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      supportedScopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    });

    this.providers.set('google', googleProvider);
  }

  /**
   * Start cleanup interval for expired PKCE parameters
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredPKCE();
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired PKCE parameters
   */
  private cleanupExpiredPKCE(): void {
    const now = new Date();
    for (const [key, params] of this.pkceStorage.entries()) {
      if (params.expiresAt < now) {
        this.pkceStorage.delete(key);
      }
    }
  }

  // ============================================================================
  // Public OAuth Flow Methods
  // ============================================================================

  /**
   * Initiate OAuth2.0 authorization flow with PKCE
   */
  async initiateOAuth(
    userId: string,
    request: OAuthInitiateRequest
  ): Promise<OAuthInitiateResponse> {
    const provider = this.getProvider(request.provider);
    
    // Generate PKCE parameters
    const pkceParams = this.generatePKCEParams();
    
    // Store PKCE parameters temporarily
    const storageKey = `${userId}:${request.provider}`;
    this.pkceStorage.set(storageKey, pkceParams);
    
    // Generate authorization URL
    const redirectUri = request.redirectUri || 
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
    
    const authorizationUrl = provider.generateAuthorizationUrl({
      scopes: request.scopes,
      redirectUri,
      state: pkceParams.state,
      codeChallenge: pkceParams.codeChallenge,
      codeChallengeMethod: pkceParams.codeChallengeMethod
    });

    return {
      authorizationUrl,
      state: pkceParams.state,
      codeChallenge: pkceParams.codeChallenge,
      codeChallengeMethod: pkceParams.codeChallengeMethod
    };
  }

  /**
   * Handle OAuth2.0 callback and exchange code for tokens
   */
  async handleOAuthCallback(
    userId: string,
    provider: OAuthProvider,
    request: OAuthCallbackRequest
  ): Promise<OAuthTokenResponse> {
    const oauthProvider = this.getProvider(provider);
    
    // Retrieve and validate PKCE parameters
    const storageKey = `${userId}:${provider}`;
    const pkceParams = this.pkceStorage.get(storageKey);
    
    if (!pkceParams) {
      throw new OAuthException('invalid_request', 'PKCE parameters not found or expired');
    }
    
    // Validate state parameter (CSRF protection)
    if (pkceParams.state !== request.state) {
      throw new OAuthException('invalid_request', 'Invalid state parameter');
    }
    
    // Validate code verifier
    if (pkceParams.codeVerifier !== request.codeVerifier) {
      throw new OAuthException('invalid_request', 'Invalid code verifier');
    }
    
    try {
      // Exchange authorization code for tokens
      const tokens = await oauthProvider.exchangeCodeForTokens({
        code: request.code,
        redirectUri: request.redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        codeVerifier: request.codeVerifier
      });
      
      // Store tokens securely
      await this.storeUserTokens(userId, provider, tokens);
      
      // Clean up PKCE parameters
      this.pkceStorage.delete(storageKey);
      
      return tokens;
    } catch (error) {
      // Clean up PKCE parameters on error
      this.pkceStorage.delete(storageKey);
      throw error;
    }
  }

  /**
   * Refresh OAuth2.0 access token
   */
  async refreshToken(
    userId: string,
    provider: OAuthProvider,
    request?: OAuthRefreshRequest
  ): Promise<OAuthTokenResponse> {
    const oauthProvider = this.getProvider(provider);
    
    // Get stored tokens
    const storedTokens = await this.getUserTokens(userId, provider);
    if (!storedTokens?.refreshToken) {
      throw new OAuthException('invalid_grant', 'No refresh token available');
    }
    
    const refreshToken = request?.refreshToken || storedTokens.refreshToken;
    
    try {
      // Refresh access token
      const tokens = await oauthProvider.refreshAccessToken(refreshToken);
      
      // Update stored tokens
      await this.storeUserTokens(userId, provider, tokens);
      
      return tokens;
    } catch (error) {
      // If refresh fails, clear stored tokens to force re-authentication
      await this.clearUserTokens(userId, provider);
      throw error;
    }
  }

  /**
   * Get valid access token (auto-refresh if needed)
   */
  async getValidAccessToken(
    userId: string,
    provider: OAuthProvider
  ): Promise<string> {
    const storedTokens = await this.getUserTokens(userId, provider);
    
    if (!storedTokens) {
      throw new OAuthException('invalid_grant', 'No tokens found for user');
    }
    
    // Check if token needs refresh
    const now = new Date();
    const refreshBuffer = new Date(now.getTime() + OAUTH_CONFIG.TOKEN_REFRESH_BUFFER * 1000);
    
    if (storedTokens.expiresAt <= refreshBuffer) {
      // Token is expired or will expire soon, refresh it
      const refreshedTokens = await this.refreshToken(userId, provider);
      return refreshedTokens.accessToken;
    }
    
    return storedTokens.accessToken;
  }

  /**
   * Revoke OAuth tokens
   */
  async revokeTokens(userId: string, provider: OAuthProvider): Promise<void> {
    const oauthProvider = this.getProvider(provider);
    const storedTokens = await this.getUserTokens(userId, provider);
    
    if (storedTokens?.accessToken) {
      try {
        await oauthProvider.revokeToken(storedTokens.accessToken);
      } catch (error) {
        // Continue with local cleanup even if revocation fails
        console.warn('Token revocation failed:', error);
      }
    }
    
    // Clear stored tokens
    await this.clearUserTokens(userId, provider);
  }

  /**
   * Get OAuth user information
   */
  async getUserInfo(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthUserInfo> {
    const oauthProvider = this.getProvider(provider);
    const accessToken = await this.getValidAccessToken(userId, provider);
    
    return oauthProvider.validateToken(accessToken);
  }

  // ============================================================================
  // Token Storage Methods
  // ============================================================================

  /**
   * Store OAuth tokens securely in Supabase user metadata
   */
  private async storeUserTokens(
    userId: string,
    provider: OAuthProvider,
    tokens: OAuthTokenResponse
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
    
    const storedTokens: StoredOAuthTokens = {
      accessToken: await this.encryptToken(tokens.accessToken),
      refreshToken: tokens.refreshToken ? await this.encryptToken(tokens.refreshToken) : undefined,
      expiresAt,
      scope: tokens.scope || '',
      tokenType: tokens.tokenType,
      provider
    };
    
    // Update user metadata in Supabase
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        [`${provider}_oauth`]: storedTokens
      }
    });
    
    if (error) {
      throw new Error(`Failed to store OAuth tokens: ${error.message}`);
    }
  }

  /**
   * Retrieve OAuth tokens from Supabase user metadata
   */
  private async getUserTokens(
    userId: string,
    provider: OAuthProvider
  ): Promise<StoredOAuthTokens | null> {
    const { data: user, error } = await this.supabase.auth.admin.getUserById(userId);
    
    if (error || !user.user) {
      throw new Error(`Failed to retrieve user: ${error?.message || 'User not found'}`);
    }
    
    const storedTokens = user.user.user_metadata?.[`${provider}_oauth`] as StoredOAuthTokens;
    
    if (!storedTokens) {
      return null;
    }
    
    // Decrypt tokens
    return {
      ...storedTokens,
      accessToken: await this.decryptToken(storedTokens.accessToken),
      refreshToken: storedTokens.refreshToken 
        ? await this.decryptToken(storedTokens.refreshToken)
        : undefined,
      expiresAt: new Date(storedTokens.expiresAt)
    };
  }

  /**
   * Clear OAuth tokens from Supabase user metadata
   */
  private async clearUserTokens(userId: string, provider: OAuthProvider): Promise<void> {
    const { data: user, error: getUserError } = await this.supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !user.user) {
      return; // User not found, nothing to clear
    }
    
    const userMetadata = { ...user.user.user_metadata };
    delete userMetadata[`${provider}_oauth`];
    
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: userMetadata
    });
    
    if (error) {
      throw new Error(`Failed to clear OAuth tokens: ${error.message}`);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get OAuth provider instance
   */
  private getProvider(provider: OAuthProvider): IOAuthProvider {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new OAuthException('unsupported_response_type', `Provider ${provider} not supported`);
    }
    return oauthProvider;
  }

  /**
   * Generate PKCE parameters
   */
  private generatePKCEParams(): PKCEParams {
    // Generate code verifier (43-128 characters, base64url)
    const codeVerifier = crypto
      .randomBytes(OAUTH_CONFIG.CODE_VERIFIER_LENGTH)
      .toString('base64url')
      .slice(0, OAUTH_CONFIG.CODE_VERIFIER_LENGTH);
    
    // Generate code challenge (SHA256 hash of verifier, base64url)
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    // Generate state parameter
    const state = crypto
      .randomBytes(OAUTH_CONFIG.STATE_LENGTH)
      .toString('hex');
    
    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
      state,
      expiresAt: new Date(Date.now() + OAUTH_CONFIG.PKCE_STORAGE_DURATION * 1000)
    };
  }

  /**
   * Encrypt token for secure storage
   */
  private async encryptToken(token: string): Promise<string> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.OAUTH_ENCRYPTION_KEY!, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('oauth-token', 'utf8'));
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt token from secure storage
   */
  private async decryptToken(encryptedToken: string): Promise<string> {
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.OAUTH_ENCRYPTION_KEY!, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('oauth-token', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Check if user has valid OAuth tokens
   */
  async hasValidTokens(userId: string, provider: OAuthProvider): Promise<boolean> {
    try {
      const storedTokens = await this.getUserTokens(userId, provider);
      if (!storedTokens) {
        return false;
      }
      
      // Check if we have either a valid access token or refresh token
      const now = new Date();
      const hasValidAccess = storedTokens.expiresAt > now;
      const hasRefresh = !!storedTokens.refreshToken;
      
      return hasValidAccess || hasRefresh;
    } catch {
      return false;
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimitInfo(
    userId: string,
    provider: OAuthProvider
  ): Promise<RateLimitInfo | null> {
    // This would be implemented based on provider-specific rate limiting
    // For now, return null indicating no rate limit tracking
    return null;
  }

  /**
   * Get quota information
   */
  async getQuotaInfo(
    userId: string,
    provider: OAuthProvider
  ): Promise<QuotaInfo | null> {
    // This would be implemented based on provider-specific quota tracking
    // For now, return null indicating no quota tracking
    return null;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Singleton OAuth manager instance
 */
export const oauthManager = new OAuthManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Convenience function to initiate OAuth flow
 */
export async function initiateOAuth(
  userId: string,
  request: OAuthInitiateRequest
): Promise<OAuthInitiateResponse> {
  return oauthManager.initiateOAuth(userId, request);
}

/**
 * Convenience function to handle OAuth callback
 */
export async function handleOAuthCallback(
  userId: string,
  provider: OAuthProvider,
  request: OAuthCallbackRequest
): Promise<OAuthTokenResponse> {
  return oauthManager.handleOAuthCallback(userId, provider, request);
}

/**
 * Convenience function to get valid access token
 */
export async function getValidAccessToken(
  userId: string,
  provider: OAuthProvider
): Promise<string> {
  return oauthManager.getValidAccessToken(userId, provider);
}

/**
 * Convenience function to refresh token
 */
export async function refreshToken(
  userId: string,
  provider: OAuthProvider,
  request?: OAuthRefreshRequest
): Promise<OAuthTokenResponse> {
  return oauthManager.refreshToken(userId, provider, request);
}

/**
 * Convenience function to revoke tokens
 */
export async function revokeTokens(
  userId: string,
  provider: OAuthProvider
): Promise<void> {
  return oauthManager.revokeTokens(userId, provider);
}

/**
 * Convenience function to check if user has valid tokens
 */
export async function hasValidTokens(
  userId: string,
  provider: OAuthProvider
): Promise<boolean> {
  return oauthManager.hasValidTokens(userId, provider);
}