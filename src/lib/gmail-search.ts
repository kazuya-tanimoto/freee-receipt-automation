import { google } from 'googleapis'
import type { gmail_v1 } from 'googleapis'

export interface GmailSearchQuery {
  query: string
  maxResults?: number
}

export interface GmailMessage {
  id: string
  subject: string
  from: string
  date: Date
  attachments: GmailAttachment[]
}

export interface GmailAttachment {
  filename: string
  mimeType: string
  data: Buffer
}

type MessageHeader = gmail_v1.Schema$MessagePartHeader
type MessagePart = gmail_v1.Schema$MessagePart

/**
 * Gmail API client for searching and retrieving receipt emails
 */
class GmailSearchService {
  private getGmailClient(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    return google.gmail({ version: 'v1', auth })
  }

  /**
   * Search Gmail messages based on query
   */
  async searchMessages(
    accessToken: string,
    searchQuery: GmailSearchQuery
  ): Promise<GmailMessage[]> {
    const gmail = this.getGmailClient(accessToken)
    const maxResults = searchQuery.maxResults || 10

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery.query,
        maxResults,
      })

      const messageIds = response.data.messages || []
      const messages: GmailMessage[] = []

      for (const messageRef of messageIds) {
        if (!messageRef.id) continue

        const message = await this.getMessageDetails(gmail, messageRef.id)
        if (message) {
          messages.push(message)
        }
      }

      return messages
    } catch (error) {
      throw new Error(
        `Gmail search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get detailed message information including attachments
   */
  private async getMessageDetails(
    gmail: gmail_v1.Gmail,
    messageId: string
  ): Promise<GmailMessage | null> {
    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })

      const message = response.data
      const headers = message.payload?.headers || []

      const subject = this.getHeaderValue(headers, 'Subject') || ''
      const from = this.getHeaderValue(headers, 'From') || ''
      const dateStr = this.getHeaderValue(headers, 'Date') || ''
      const date = dateStr ? new Date(dateStr) : new Date()

      const attachments = await this.extractPdfAttachments(gmail, messageId, message.payload || {})

      return {
        id: messageId,
        subject,
        from,
        date,
        attachments,
      }
    } catch (error) {
      console.error(`Failed to get message details for ${messageId}:`, error)
      return null
    }
  }

  /**
   * Extract PDF attachments from message payload
   */
  private async extractPdfAttachments(
    gmail: gmail_v1.Gmail,
    messageId: string,
    payload: MessagePart
  ): Promise<GmailAttachment[]> {
    const attachments: GmailAttachment[] = []

    const extractFromParts = async (parts: MessagePart[]): Promise<void> => {
      for (const part of parts) {
        if (part.parts) {
          await extractFromParts(part.parts)
        } else if (this.isPdfAttachment(part)) {
          const attachment = await this.getAttachmentData(gmail, messageId, part)
          if (attachment) {
            attachments.push(attachment)
          }
        }
      }
    }

    if (payload.parts) {
      await extractFromParts(payload.parts)
    } else if (this.isPdfAttachment(payload)) {
      const attachment = await this.getAttachmentData(gmail, messageId, payload)
      if (attachment) {
        attachments.push(attachment)
      }
    }

    return attachments
  }

  /**
   * Check if a part is a PDF attachment
   */
  private isPdfAttachment(part: MessagePart): boolean {
    return Boolean(
      part.filename?.toLowerCase().endsWith('.pdf') &&
        part.body?.attachmentId &&
        part.mimeType === 'application/pdf'
    )
  }

  /**
   * Get attachment data from Gmail API
   */
  private async getAttachmentData(
    gmail: gmail_v1.Gmail,
    messageId: string,
    part: MessagePart
  ): Promise<GmailAttachment | null> {
    try {
      if (!part.body?.attachmentId) {
        return null
      }

      const response = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: part.body.attachmentId,
      })

      const data = Buffer.from(response.data.data || '', 'base64')

      return {
        filename: part.filename || '',
        mimeType: part.mimeType || '',
        data,
      }
    } catch (error) {
      console.error('Failed to get attachment data:', error)
      return null
    }
  }

  /**
   * Extract header value from message headers
   */
  private getHeaderValue(headers: MessageHeader[], name: string): string | null {
    const header = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
    return header?.value || null
  }
}

export const gmailSearchService = new GmailSearchService()

/**
 * Search Gmail messages for receipts with PDF attachments
 * @param accessToken - Valid Gmail access token
 * @param searchQuery - Search query parameters
 * @returns Array of Gmail messages with PDF attachments
 */
export async function searchGmailMessages(
  accessToken: string,
  searchQuery: GmailSearchQuery
): Promise<GmailMessage[]> {
  return gmailSearchService.searchMessages(accessToken, searchQuery)
}
