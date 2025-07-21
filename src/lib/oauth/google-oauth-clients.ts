/**
 * Google OAuth API Clients
 * 
 * Gmail and Drive API client implementations with compatibility layer.
 */

import { google } from 'googleapis';
import { GoogleOAuthCore } from './google-oauth-core';

// ============================================================================
// Google OAuth with API Clients
// ============================================================================

/**
 * Google OAuth provider with API client functionality
 */
export class GoogleOAuthClients extends GoogleOAuthCore {
  /**
   * Get Gmail API client with compatibility layer
   */
  getGmailClient(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    // Compatibility layer for existing code patterns
    return {
      listMessages: async (params: any = {}) => {
        const result = await gmail.users.messages.list({
          userId: 'me',
          q: params.q,
          maxResults: params.maxResults,
          pageToken: params.pageToken
        });
        return {
          messages: result.data.messages || [],
          nextPageToken: result.data.nextPageToken || undefined,
          resultSizeEstimate: result.data.resultSizeEstimate || 0
        };
      },
      
      getMessage: async (messageId: string, format = 'full') => {
        const result = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: format as any
        });
        return {
          id: result.data.id || '',
          threadId: result.data.threadId || '',
          snippet: result.data.snippet || '',
          payload: result.data.payload || null,
          labelIds: result.data.labelIds || [],
          sizeEstimate: result.data.sizeEstimate || 0,
          historyId: result.data.historyId || '',
          internalDate: result.data.internalDate || ''
        };
      },
      
      getAttachment: async (messageId: string, attachmentId: string) => {
        const result = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId,
          id: attachmentId
        });
        return {
          data: result.data.data,
          size: result.data.size,
          filename: `attachment_${attachmentId}`,
          mimeType: 'application/octet-stream'
        };
      }
    };
  }

  /**
   * Get Drive API client with compatibility layer
   */
  getDriveClient(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    // Compatibility layer for existing code patterns
    return {
      listFiles: async (params: any = {}) => {
        const result = await drive.files.list({
          q: params.q,
          pageSize: params.pageSize,
          pageToken: params.pageToken,
          fields: params.fields,
          orderBy: params.orderBy
        });
        return {
          files: result.data.files || [],
          nextPageToken: result.data.nextPageToken || undefined,
          incompleteSearch: result.data.incompleteSearch || false
        };
      },
      
      getFile: async (fileId: string, options: any = {}) => {
        const result = await drive.files.get({
          fileId,
          alt: options.alt
        });
        return result.data;
      },
      
      downloadFile: async (fileId: string) => {
        const result = await drive.files.get({
          fileId,
          alt: 'media'
        });
        return result.data;
      },
      
      createFile: async (params: any) => {
        const result = await drive.files.create(params);
        return result.data;
      },
      
      deleteFile: async (fileId: string) => {
        const result = await drive.files.delete({ fileId });
        return result.data;
      }
    };
  }
}