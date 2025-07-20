/**
 * Google Drive File List Utilities
 * 
 * Helper functions for file processing, receipt detection, and query building
 */

import { DriveFile, ReceiptSearchCriteria } from './file-list-types';

// ============================================================================
// File Processing Utilities
// ============================================================================

export function processDriveFile(rawFile: any, criteria: ReceiptSearchCriteria): DriveFile {
  const isReceiptCandidate = detectReceiptFile(rawFile, criteria);
  const confidenceScore = calculateConfidenceScore(rawFile, criteria);

  return {
    id: rawFile.id,
    name: rawFile.name || 'Untitled',
    mimeType: rawFile.mimeType || 'unknown',
    size: rawFile.size ? parseInt(rawFile.size) : undefined,
    createdTime: new Date(rawFile.createdTime),
    modifiedTime: new Date(rawFile.modifiedTime),
    parents: rawFile.parents,
    webViewLink: rawFile.webViewLink,
    webContentLink: rawFile.webContentLink,
    isReceiptCandidate,
    confidenceScore,
    thumbnailLink: rawFile.thumbnailLink,
    fileExtension: rawFile.fileExtension,
    md5Checksum: rawFile.md5Checksum
  };
}

// ============================================================================
// Receipt Detection Utilities
// ============================================================================

export function detectReceiptFile(file: any, criteria: ReceiptSearchCriteria): boolean {
  const fileName = (file.name || '').toLowerCase();
  const mimeType = file.mimeType || '';

  // Check name patterns
  const hasReceiptName = criteria.namePatterns.some(
    pattern => pattern.test(fileName)
  );

  // Check MIME type
  const hasReceiptMimeType = criteria.mimeTypes.includes(mimeType);

  // Check file extension
  const fileExtension = file.fileExtension || '';
  const hasReceiptExtension = ['pdf', 'png', 'jpg', 'jpeg'].includes(fileExtension.toLowerCase());

  return hasReceiptName || (hasReceiptMimeType && fileName.length > 0) || hasReceiptExtension;
}

export function calculateConfidenceScore(file: any, criteria: ReceiptSearchCriteria): number {
  let score = 0;
  const fileName = (file.name || '').toLowerCase();
  const mimeType = file.mimeType || '';

  // Name pattern matching (high confidence)
  const nameMatches = criteria.namePatterns.filter(
    pattern => pattern.test(fileName)
  );
  if (nameMatches.length > 0) {
    score += 0.6;
  }

  // MIME type matching
  if (criteria.mimeTypes.includes(mimeType)) {
    score += 0.3;
  }

  // File size considerations (receipts are usually not too large)
  const fileSize = file.size ? parseInt(file.size) : 0;
  if (fileSize > 0 && fileSize < 10 * 1024 * 1024) { // Less than 10MB
    score += 0.1;
  }

  // Recent files get slight boost
  const modifiedTime = new Date(file.modifiedTime);
  const daysSinceModified = (Date.now() - modifiedTime.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceModified <= 30) {
    score += 0.05;
  }

  return Math.min(score, 1.0);
}

// ============================================================================
// Query Building Utilities
// ============================================================================

export function buildReceiptQuery(criteria: ReceiptSearchCriteria): string {
  const namePatterns = criteria.namePatterns
    .map(pattern => {
      // Extract the pattern string without regex flags
      const patternStr = pattern.source.toLowerCase();
      return `name contains '${patternStr}'`;
    })
    .slice(0, 5) // Limit to avoid overly complex queries
    .join(' or ');

  const mimeTypeQuery = criteria.mimeTypes
    .map(type => `mimeType = '${type}'`)
    .join(' or ');

  return `(${namePatterns}) and (${mimeTypeQuery}) and trashed = false`;
}

// ============================================================================
// Async Utilities
// ============================================================================

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}