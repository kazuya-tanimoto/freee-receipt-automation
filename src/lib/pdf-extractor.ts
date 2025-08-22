import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { GmailAttachment } from './gmail-search'

export interface PDFExtraction {
  filename: string
  buffer: Buffer
  isValid: boolean
  filePath?: string
}

export interface PDFProcessor {
  extractPDF(attachment: GmailAttachment): Promise<PDFExtraction>
  validatePDF(buffer: Buffer): boolean
  saveTempFile(buffer: Buffer, filename: string): Promise<string>
}

/**
 * PDF file processor for extracting and validating PDF attachments
 */
export class PDFExtractorService implements PDFProcessor {
  /**
   * Extract PDF from Gmail attachment with validation and temp file creation
   * @param attachment - Gmail attachment containing PDF data
   * @returns PDFExtraction with validation status and file path
   */
  async extractPDF(attachment: GmailAttachment): Promise<PDFExtraction> {
    const isValid = this.validatePDF(attachment.data)
    const extraction: PDFExtraction = {
      filename: attachment.filename,
      buffer: attachment.data,
      isValid,
    }

    if (isValid) {
      try {
        extraction.filePath = await this.saveTempFile(attachment.data, attachment.filename)
      } catch (error) {
        console.error('Failed to save temp file:', error)
      }
    }

    return extraction
  }

  /**
   * Validate if buffer contains valid PDF data by checking magic number
   * @param buffer - Buffer data to validate
   * @returns true if valid PDF format, false otherwise
   */
  validatePDF(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) return false
    const pdfHeader = buffer.subarray(0, 4).toString('ascii')
    return pdfHeader === '%PDF'
  }

  /**
   * Save PDF buffer to temporary file with timestamp prefix
   * @param buffer - PDF buffer data to save
   * @param filename - Original filename
   * @returns Path to saved temporary file
   */
  async saveTempFile(buffer: Buffer, filename: string): Promise<string> {
    const tempDir = join(tmpdir(), 'freee-receipts')
    await fs.mkdir(tempDir, { recursive: true })

    const timestamp = Date.now()
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = join(tempDir, `${timestamp}_${safeFilename}`)

    await fs.writeFile(filePath, new Uint8Array(buffer))
    return filePath
  }
}

export const pdfExtractor = new PDFExtractorService()
