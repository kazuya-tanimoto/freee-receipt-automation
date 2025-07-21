/**
 * OAuth Manager Implementation
 * 
 * Core OAuth manager for handling authentication flows.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  OAuthProvider,
  OAuthInitiateRequest,
  OAuthInitiateResponse,
  OAuthCallbackRequest,
  OAuthTokenResponse,
  PKCEParams,
  OAuthException,
  OAUTH_CONFIG
} from './types';
import { GoogleOAuth } from './google-oauth';

// ============================================================================
// OAuth Manager Class
// ============================================================================

/**
 * Simplified OAuth manager for Google authentication
 */
export class OAuthManager {
  private googleProvider: GoogleOAuth;
  private pkceStorage: Map<string, PKCEParams> = new Map();
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  constructor() {
    this.googleProvider = new GoogleOAuth({
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
  }

  /**
   * Initiate OAuth flow
   */
  async initiateOAuth(userId: string, request: OAuthInitiateRequest): Promise<OAuthInitiateResponse> {
    const pkceParams = this.generatePKCE();
    const storageKey = `${userId}:${request.provider}`;
    this.pkceStorage.set(storageKey, pkceParams);
    
    const redirectUri = request.redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
    
    const authorizationUrl = this.googleProvider.generateAuthorizationUrl({
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
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    userId: string,
    provider: OAuthProvider,
    request: OAuthCallbackRequest
  ): Promise<OAuthTokenResponse> {
    const storageKey = `${userId}:${provider}`;
    const pkceParams = this.pkceStorage.get(storageKey);
    
    if (!pkceParams || pkceParams.state !== request.state) {
      throw new OAuthException('invalid_request', 'Invalid PKCE parameters');
    }
    
    const tokens = await this.googleProvider.exchangeCodeForTokens({
      code: request.code,
      redirectUri: request.redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      codeVerifier: request.codeVerifier
    });
    
    await this.storeTokens(userId, provider, tokens);
    this.pkceStorage.delete(storageKey);
    
    return tokens;
  }

  /**
   * Get valid access token
   */
  async getValidAccessToken(userId: string, provider: OAuthProvider): Promise<string> {
    const tokens = await this.getStoredTokens(userId, provider);
    
    if (!tokens) {
      throw new OAuthException('invalid_grant', 'No tokens found');
    }
    
    // Simple expiry check
    if (tokens.expiresAt <= new Date()) {
      const refreshed = await this.googleProvider.refreshAccessToken(tokens.refreshToken);
      await this.storeTokens(userId, provider, refreshed);
      return refreshed.accessToken;
    }
    
    return tokens.accessToken;
  }

  /**
   * Refresh token
   */
  async refreshToken(userId: string, provider: OAuthProvider): Promise<OAuthTokenResponse> {
    const tokens = await this.getStoredTokens(userId, provider);
    
    if (!tokens?.refreshToken) {
      throw new OAuthException('invalid_grant', 'No refresh token');
    }
    
    const refreshed = await this.googleProvider.refreshAccessToken(tokens.refreshToken);
    await this.storeTokens(userId, provider, refreshed);
    
    return refreshed;
  }

  /**
   * Revoke tokens
   */
  async revokeTokens(userId: string, provider: OAuthProvider): Promise<void> {
    const tokens = await this.getStoredTokens(userId, provider);
    
    if (tokens?.accessToken) {
      await this.googleProvider.revokeTokens(tokens.accessToken);
    }
    
    await this.clearTokens(userId, provider);
  }

  /**
   * Check if user has valid tokens
   */
  async hasValidTokens(userId: string, provider: OAuthProvider): Promise<boolean> {
    try {
      await this.getValidAccessToken(userId, provider);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private generatePKCE(): PKCEParams {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');
    
    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
      state,
      expiresAt: new Date(Date.now() + OAUTH_CONFIG.PKCE_STORAGE_DURATION * 1000)
    };
  }

  private async storeTokens(userId: string, provider: OAuthProvider, tokens: OAuthTokenResponse): Promise<void> {
    const { error } = await this.supabase.from('user_tokens').upsert({
      user_id: userId,
      provider,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
      scope: tokens.scope
    });
    
    if (error) throw new Error(`Failed to store tokens: ${error.message}`);
  }

  private async getStoredTokens(userId: string, provider: OAuthProvider): Promise<any> {
    const { data } = await this.supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
    
    if (!data) return null;
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at),
      scope: data.scope
    };
  }

  private async clearTokens(userId: string, provider: OAuthProvider): Promise<void> {
    await this.supabase
      .from('user_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);
  }
}