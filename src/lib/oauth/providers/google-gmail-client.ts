/**
 * Google Gmail API Client
 * 
 * Gmail API integration for Google OAuth provider
 */

import { GoogleOAuthCore } from './google-oauth-core';
import { OAuthException } from '../types';

// ============================================================================
// Gmail API Client Mixin
// ============================================================================

/**
 * Gmail API client functionality for Google OAuth provider
 */
export class GoogleGmailClient extends GoogleOAuthCore {
  /**
   * Get Gmail API client
   */
  getGmailApiClient(accessToken: string) {
    return {
      /**
       * List Gmail messages
       */
      listMessages: async (params: {
        q?: string;
        maxResults?: number;
        pageToken?: string;
      } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set('q', params.q);
        if (params.maxResults) searchParams.set('maxResults', params.maxResults.toString());
        if (params.pageToken) searchParams.set('pageToken', params.pageToken);

        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${searchParams}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        return {
          messages: response.messages || [],
          nextPageToken: response.nextPageToken,
          resultSizeEstimate: response.resultSizeEstimate || 0
        };
      },

      /**
       * Get Gmail message details
       */
      getMessage: async (messageId: string, format = 'full') => {
        const searchParams = new URLSearchParams();
        if (format) searchParams.set('format', format);

        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?${searchParams}`;
        return this.makeAuthenticatedRequest(accessToken, endpoint);
      },

      /**
       * Get Gmail message attachments
       */
      getAttachment: async (messageId: string, attachmentId: string) => {
        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
        return this.makeAuthenticatedRequest(accessToken, endpoint);
      },

      /**
       * Send Gmail message
       */
      sendMessage: async (rawMessage: string) => {
        const endpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: rawMessage
          })
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new OAuthException('token_expired', 'Access token has expired');
          }
          throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },

      /**
       * Create Gmail draft
       */
      createDraft: async (rawMessage: string) => {
        const endpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/drafts';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: {
              raw: rawMessage
            }
          })
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new OAuthException('token_expired', 'Access token has expired');
          }
          throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },

      /**
       * Get Gmail labels
       */
      getLabels: async () => {
        const endpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/labels';
        return this.makeAuthenticatedRequest(accessToken, endpoint);
      },

      /**
       * Modify message labels
       */
      modifyLabels: async (messageId: string, addLabelIds: string[] = [], removeLabelIds: string[] = []) => {
        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            addLabelIds,
            removeLabelIds
          })
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new OAuthException('token_expired', 'Access token has expired');
          }
          throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },

      /**
       * Get Gmail profile
       */
      getProfile: async () => {
        const endpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
        return this.makeAuthenticatedRequest(accessToken, endpoint);
      }
    };
  }
}