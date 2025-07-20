/**
 * Google OAuth2.0 Core Provider Implementation
 * 
 * Core OAuth2.0 functionality for Google authentication
 */

import { GoogleOAuthConfig } from '../types';
import { GoogleOAuthHelpers } from './google-oauth-helpers';

// ============================================================================
// Google OAuth Core Provider Implementation
// ============================================================================

/**
 * Google OAuth2.0 core provider implementation
 */
export class GoogleOAuthCore extends GoogleOAuthHelpers {
  constructor(config: GoogleOAuthConfig) {
    super(config);
  }
}