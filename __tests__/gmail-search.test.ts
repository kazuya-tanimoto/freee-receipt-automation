import { gmailSearchService, searchGmailMessages } from '@/lib/gmail-search'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock googleapis
const mockList = vi.fn()
const mockGet = vi.fn()
const mockAttachmentGet = vi.fn()

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
      })),
    },
    gmail: vi.fn().mockImplementation(() => ({
      users: {
        messages: {
          list: mockList,
          get: mockGet,
          attachments: {
            get: mockAttachmentGet,
          },
        },
      },
    })),
  },
}))

describe('GmailSearchService', () => {
  const mockAccessToken = 'mock_access_token'

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock responses
    mockList.mockResolvedValue({
      data: {
        messages: [{ id: 'msg1' }, { id: 'msg2' }],
      },
    })

    mockGet.mockResolvedValue({
      data: {
        id: 'msg1',
        payload: {
          headers: [
            { name: 'Subject', value: 'Apple Receipt' },
            { name: 'From', value: 'noreply@apple.com' },
            { name: 'Date', value: 'Mon, 01 Jan 2024 12:00:00 GMT' },
          ],
          parts: [
            {
              filename: 'receipt.pdf',
              mimeType: 'application/pdf',
              body: {
                attachmentId: 'att123',
              },
            },
          ],
        },
      },
    })

    mockAttachmentGet.mockResolvedValue({
      data: {
        data: Buffer.from('mock pdf data').toString('base64'),
      },
    })
  })

  describe('searchMessages', () => {
    it('should search Gmail messages and extract PDF attachments', async () => {
      const searchQuery = {
        query: 'has:attachment filename:pdf apple receipt',
        maxResults: 5,
      }

      const messages = await gmailSearchService.searchMessages(mockAccessToken, searchQuery)

      expect(messages).toHaveLength(2)
      expect(messages[0]).toEqual({
        id: 'msg1',
        subject: 'Apple Receipt',
        from: 'noreply@apple.com',
        date: expect.any(Date),
        attachments: [
          {
            filename: 'receipt.pdf',
            mimeType: 'application/pdf',
            data: expect.any(Buffer),
          },
        ],
      })
    })

    it('should use default maxResults when not specified', async () => {
      const searchQuery = { query: 'test query' }

      await gmailSearchService.searchMessages(mockAccessToken, searchQuery)

      expect(mockList).toHaveBeenCalledWith({
        userId: 'me',
        q: 'test query',
        maxResults: 10,
      })
    })

    it('should handle search errors gracefully', async () => {
      mockList.mockRejectedValueOnce(new Error('API Error'))

      const searchQuery = { query: 'test query' }

      await expect(gmailSearchService.searchMessages(mockAccessToken, searchQuery)).rejects.toThrow(
        'Gmail search failed: API Error'
      )
    })

    it('should handle empty search results', async () => {
      mockList.mockResolvedValueOnce({
        data: { messages: [] },
      })

      const searchQuery = { query: 'nonexistent query' }
      const messages = await gmailSearchService.searchMessages(mockAccessToken, searchQuery)

      expect(messages).toHaveLength(0)
    })

    it('should filter out non-PDF attachments', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          id: 'msg1',
          payload: {
            headers: [
              { name: 'Subject', value: 'Test Message' },
              { name: 'From', value: 'test@example.com' },
              { name: 'Date', value: 'Mon, 01 Jan 2024 12:00:00 GMT' },
            ],
            parts: [
              {
                filename: 'document.docx',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                body: { attachmentId: 'att123' },
              },
              {
                filename: 'image.jpg',
                mimeType: 'image/jpeg',
                body: { attachmentId: 'att456' },
              },
            ],
          },
        },
      })

      const searchQuery = { query: 'test query' }
      const messages = await gmailSearchService.searchMessages(mockAccessToken, searchQuery)

      expect(messages[0].attachments).toHaveLength(0)
    })
  })

  describe('searchGmailMessages function', () => {
    it('should export convenience function that calls service', async () => {
      const searchQuery = { query: 'test query' }
      const messages = await searchGmailMessages(mockAccessToken, searchQuery)

      expect(messages).toHaveLength(2)
      expect(messages[0].id).toBe('msg1')
    })
  })
})
