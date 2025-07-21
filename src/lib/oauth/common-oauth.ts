/**
 * Common OAuth Functions
 * 
 * Convenience functions for OAuth operations.
 */

import { OAuthManager } from './oauth-manager';
import {
  OAuthProvider,
  OAuthInitiateRequest,
  OAuthInitiateResponse,
  OAuthCallbackRequest,
  OAuthTokenResponse
} from './types';

// ============================================================================
// Singleton Instance
// ============================================================================

let _oauthManager: OAuthManager | null = null;

export const getOAuthManager = (): OAuthManager => {
  if (!_oauthManager) {
    _oauthManager = new OAuthManager();
  }
  return _oauthManager;
};

// ============================================================================
// Convenience Functions
// ============================================================================

export async function initiateOAuth(
  userId: string,
  request: OAuthInitiateRequest
): Promise<OAuthInitiateResponse> {
  return getOAuthManager().initiateOAuth(userId, request);
}

export async function handleOAuthCallback(
  userId: string,
  provider: OAuthProvider,
  request: OAuthCallbackRequest
): Promise<OAuthTokenResponse> {
  return getOAuthManager().handleOAuthCallback(userId, provider, request);
}

export async function getValidAccessToken(
  userId: string,
  provider: OAuthProvider
): Promise<string> {
  return getOAuthManager().getValidAccessToken(userId, provider);
}

export async function refreshToken(
  userId: string,
  provider: OAuthProvider
): Promise<OAuthTokenResponse> {
  return getOAuthManager().refreshToken(userId, provider);
}

export async function revokeTokens(
  userId: string,
  provider: OAuthProvider
): Promise<void> {
  return getOAuthManager().revokeTokens(userId, provider);
}

export async function hasValidTokens(
  userId: string,
  provider: OAuthProvider
): Promise<boolean> {
  return getOAuthManager().hasValidTokens(userId, provider);
}