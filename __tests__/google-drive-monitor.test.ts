import type { DetectedFile, DriveFileDetection } from '@/types/config'
import { describe, expect, it, vi } from 'vitest'

// Mock the Google Drive API calls
const mockDriveAPI = {
  files: {
    list: vi.fn(),
  },
}

vi.mock('googleapis', () => ({
  google: {
    drive: () => mockDriveAPI,
  },
}))

describe('Google Drive Monitor', () => {
  describe('detectNewPDFs', () => {
    it('should detect new PDF files in folder', async () => {
      const { GoogleDriveMonitor } = await import('@/lib/google-drive-monitor')

      // Mock API response
      mockDriveAPI.files.list.mockResolvedValue({
        data: {
          files: [
            {
              id: 'file1',
              name: 'receipt-2024.pdf',
              mimeType: 'application/pdf',
              modifiedTime: '2024-01-01T00:00:00.000Z',
            },
          ],
        },
      })

      const monitor = new GoogleDriveMonitor('test-api-key')
      const config: DriveFileDetection = { folderId: 'test-folder-id' }

      const files = await monitor.detectNewPDFs(config)

      expect(files).toHaveLength(1)
      expect(files[0].fileName).toBe('receipt-2024.pdf')
    })

    it('should filter out non-PDF files', async () => {
      const { GoogleDriveMonitor } = await import('@/lib/google-drive-monitor')

      mockDriveAPI.files.list.mockResolvedValue({
        data: {
          files: [
            {
              id: 'file1',
              name: 'document.txt',
              mimeType: 'text/plain',
              modifiedTime: '2024-01-01T00:00:00.000Z',
            },
          ],
        },
      })

      const monitor = new GoogleDriveMonitor('test-api-key')
      const config: DriveFileDetection = { folderId: 'test-folder-id' }

      const files = await monitor.detectNewPDFs(config)

      expect(files).toHaveLength(0)
    })
  })
})
