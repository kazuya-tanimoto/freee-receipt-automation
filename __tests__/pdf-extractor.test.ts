import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { GmailAttachment } from '../src/lib/gmail-search'
import { PDFExtractorService } from '../src/lib/pdf-extractor'

describe('PDFExtractorService', () => {
  let service: PDFExtractorService
  let tempFiles: string[] = []

  beforeEach(() => {
    service = new PDFExtractorService()
    tempFiles = []
  })

  afterEach(async () => {
    for (const file of tempFiles) {
      try {
        await fs.unlink(file)
      } catch {
        // Ignore cleanup errors
      }
    }
  })

  describe('validatePDF', () => {
    it('should return true for valid PDF buffer', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4\n%dummy content')
      expect(service.validatePDF(validPdfBuffer)).toBe(true)
    })

    it('should return false for invalid PDF buffer', () => {
      const invalidBuffer = Buffer.from('Not a PDF file')
      expect(service.validatePDF(invalidBuffer)).toBe(false)
    })

    it('should return false for empty buffer', () => {
      const emptyBuffer = Buffer.alloc(0)
      expect(service.validatePDF(emptyBuffer)).toBe(false)
    })

    it('should return false for buffer shorter than 4 bytes', () => {
      const shortBuffer = Buffer.from('PDF')
      expect(service.validatePDF(shortBuffer)).toBe(false)
    })
  })

  describe('saveTempFile', () => {
    it('should save buffer to temporary file', async () => {
      const buffer = Buffer.from('%PDF-1.4\n%test content')
      const filename = 'test.pdf'

      const filePath = await service.saveTempFile(buffer, filename)
      tempFiles.push(filePath)

      expect(filePath).toContain('freee-receipts')
      expect(filePath).toContain('test.pdf')

      const savedContent = await fs.readFile(filePath)
      expect(Array.from(savedContent)).toEqual(Array.from(buffer))
    })

    it('should sanitize filename', async () => {
      const buffer = Buffer.from('%PDF-1.4\n%test')
      const unsafeFilename = 'test/file<>name.pdf'

      const filePath = await service.saveTempFile(buffer, unsafeFilename)
      tempFiles.push(filePath)

      expect(filePath).toContain('test_file__name.pdf')
    })
  })

  describe('extractPDF', () => {
    it('should extract valid PDF attachment', async () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4\n%test content')
      const attachment: GmailAttachment = {
        filename: 'receipt.pdf',
        mimeType: 'application/pdf',
        data: validPdfBuffer,
      }

      const result = await service.extractPDF(attachment)
      if (result.filePath) {
        tempFiles.push(result.filePath)
      }

      expect(result.filename).toBe('receipt.pdf')
      expect(result.buffer).toEqual(validPdfBuffer)
      expect(result.isValid).toBe(true)
      expect(result.filePath).toBeDefined()
    })

    it('should handle invalid PDF attachment', async () => {
      const invalidBuffer = Buffer.from('Not a PDF')
      const attachment: GmailAttachment = {
        filename: 'fake.pdf',
        mimeType: 'application/pdf',
        data: invalidBuffer,
      }

      const result = await service.extractPDF(attachment)

      expect(result.filename).toBe('fake.pdf')
      expect(result.buffer).toEqual(invalidBuffer)
      expect(result.isValid).toBe(false)
      expect(result.filePath).toBeUndefined()
    })
  })
})
