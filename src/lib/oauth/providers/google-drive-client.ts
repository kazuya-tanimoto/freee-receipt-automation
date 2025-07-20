/**
 * Google Drive API Client
 * 
 * Drive API integration for Google OAuth provider
 */

import { GoogleGmailClient } from './google-gmail-client';
import { OAuthException } from '../types';

// ============================================================================
// Drive API Client Mixin
// ============================================================================

/**
 * Drive API client functionality for Google OAuth provider
 */
export class GoogleDriveClient extends GoogleGmailClient {
  /**
   * Get Google Drive API client
   */
  getDriveApiClient(accessToken: string) {
    return {
      /**
       * List Drive files
       */
      listFiles: async (params: {
        q?: string;
        pageSize?: number;
        pageToken?: string;
        fields?: string;
        orderBy?: string;
      } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set('q', params.q);
        if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
        if (params.pageToken) searchParams.set('pageToken', params.pageToken);
        if (params.fields) searchParams.set('fields', params.fields);
        if (params.orderBy) searchParams.set('orderBy', params.orderBy);

        const endpoint = `https://www.googleapis.com/drive/v3/files?${searchParams}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        return {
          files: response.files || [],
          nextPageToken: response.nextPageToken,
          incompleteSearch: response.incompleteSearch || false
        };
      },

      /**
       * Get Drive file metadata
       */
      getFile: async (fileId: string, fields?: string) => {
        const searchParams = new URLSearchParams();
        if (fields) searchParams.set('fields', fields);

        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}?${searchParams}`;
        return this.makeAuthenticatedRequest(accessToken, endpoint);
      },

      /**
       * Download Drive file content
       */
      downloadFile: async (fileId: string) => {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new OAuthException('token_expired', 'Access token has expired');
          }
          throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.blob();
      },

      /**
       * Create Drive file
       */
      createFile: async (metadata: any, media?: Blob) => {
        const endpoint = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        
        let body: string;
        let contentType: string;

        if (media) {
          // Multipart upload with metadata and media
          const boundary = '-------314159265358979323846';
          const delimiter = `\r\n--${boundary}\r\n`;
          const close_delim = `\r\n--${boundary}--`;

          body = delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${media.type}\r\n\r\n` +
            await media.text() +
            close_delim;

          contentType = `multipart/related; boundary="${boundary}"`;
        } else {
          // Metadata only
          body = JSON.stringify(metadata);
          contentType = 'application/json';
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': contentType
          },
          body: body
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
       * Update Drive file
       */
      updateFile: async (fileId: string, metadata: any, media?: Blob) => {
        const endpoint = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        
        let body: string;
        let contentType: string;

        if (media) {
          // Multipart upload with metadata and media
          const boundary = '-------314159265358979323846';
          const delimiter = `\r\n--${boundary}\r\n`;
          const close_delim = `\r\n--${boundary}--`;

          body = delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${media.type}\r\n\r\n` +
            await media.text() +
            close_delim;

          contentType = `multipart/related; boundary="${boundary}"`;
        } else {
          // Metadata only
          body = JSON.stringify(metadata);
          contentType = 'application/json';
        }

        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': contentType
          },
          body: body
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
       * Delete Drive file
       */
      deleteFile: async (fileId: string) => {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}`;
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new OAuthException('token_expired', 'Access token has expired');
          }
          throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.status === 204;
      },


      /**
       * Copy Drive file
       */
      copyFile: async (fileId: string, metadata: any) => {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}/copy`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadata)
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new OAuthException('token_expired', 'Access token has expired');
          }
          throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      }
    };
  }
}