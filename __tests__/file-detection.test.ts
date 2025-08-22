import { isPDFFile, isValidFileName } from '@/lib/file-detection'
import { describe, expect, it } from 'vitest'

describe('File Detection', () => {
  describe('isPDFFile', () => {
    it('should detect PDF files by MIME type', () => {
      expect(isPDFFile('application/pdf')).toBe(true)
      expect(isPDFFile('text/plain')).toBe(false)
      expect(isPDFFile('image/jpeg')).toBe(false)
    })

    it('should handle empty MIME types', () => {
      expect(isPDFFile('')).toBe(false)
    })

    it('should handle invalid MIME types', () => {
      expect(isPDFFile('invalid-mime-type')).toBe(false)
    })
  })

  describe('isValidFileName', () => {
    it('should accept receipt-related file names', () => {
      expect(isValidFileName('receipt-2024.pdf')).toBe(true)
      expect(isValidFileName('rakuten-order-123.pdf')).toBe(true)
      expect(isValidFileName('amazon-invoice.pdf')).toBe(true)
      expect(isValidFileName('scan_receipt.pdf')).toBe(true)
    })

    it('should reject non-receipt file names', () => {
      expect(isValidFileName('vacation-photos.pdf')).toBe(false)
      expect(isValidFileName('meeting-notes.pdf')).toBe(false)
    })

    it('should handle empty or short file names', () => {
      expect(isValidFileName('')).toBe(false)
      expect(isValidFileName('a.pdf')).toBe(false)
    })
  })
})
