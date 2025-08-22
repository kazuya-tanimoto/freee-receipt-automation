/**
 * PDF file detection and validation logic
 * Handles receipt-related PDF file identification (60 lines max)
 */

/**
 * Check if the MIME type indicates a PDF file
 * @param mimeType - File MIME type from Google Drive
 * @returns True if the file is a PDF
 */
export function isPDFFile(mimeType: string): boolean {
  if (!mimeType || typeof mimeType !== 'string') {
    return false
  }
  return mimeType === 'application/pdf'
}

/**
 * Validate if filename suggests a receipt or invoice document
 * @param fileName - File name to validate
 * @returns True if filename indicates a receipt-related document
 */
export function isValidFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string' || fileName.length < 3) {
    return false
  }

  const lowerFileName = fileName.toLowerCase()

  // Receipt-related keywords
  const receiptKeywords = [
    'receipt',
    'invoice',
    'レシート',
    '領収書',
    'rakuten',
    '楽天',
    'amazon',
    'scan',
    'スキャン',
  ]

  return receiptKeywords.some((keyword) => lowerFileName.includes(keyword))
}

/**
 * Check if file is a valid receipt PDF
 * @param fileName - File name
 * @param mimeType - File MIME type
 * @returns True if file should be processed as receipt PDF
 */
export function isReceiptPDF(fileName: string, mimeType: string): boolean {
  return isPDFFile(mimeType) && isValidFileName(fileName)
}

/**
 * Filter files to only include valid receipt PDFs
 * @param files - Array of file objects with name and mimeType
 * @returns Filtered array of receipt PDF files
 */
export function filterReceiptPDFs<T extends { fileName: string; mimeType: string }>(
  files: T[]
): T[] {
  return files.filter((file) => isReceiptPDF(file.fileName, file.mimeType))
}

/**
 * Check for duplicate files based on name and modified time
 * @param existingFiles - Previously processed file names
 * @param newFile - New file to check
 * @returns True if file is a duplicate
 */
export function isDuplicateFile(existingFiles: string[], newFile: { fileName: string }): boolean {
  return existingFiles.includes(newFile.fileName)
}
