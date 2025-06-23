/**
 * Attachment Validation Processor
 * 
 * Comprehensive attachment validation with security checks, file type verification,
 * and receipt-specific validation for safe and accurate processing.
 */

import { AttachmentInfo, AttachmentData, ValidatedAttachment } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface ValidationConfig {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  enableSecurityChecks?: boolean;
  enableReceiptValidation?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  isReceiptCandidate: boolean;
  confidence: number;
  issues: ValidationIssue[];
  metadata: AttachmentMetadata;
}

export interface ValidationIssue {
  type: 'security' | 'format' | 'size' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  code: string;
}

export interface AttachmentMetadata {
  fileType: string;
  estimatedContent: 'receipt' | 'document' | 'image' | 'unknown';
  securityRisk: 'none' | 'low' | 'medium' | 'high';
  processingRecommendation: 'process' | 'manual_review' | 'reject';
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<ValidationConfig> = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/tiff',
    'image/webp'
  ],
  allowedExtensions: [
    '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.tiff', '.tif', '.webp'
  ],
  enableSecurityChecks: true,
  enableReceiptValidation: true
};

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar',
  '.com', '.msi', '.dll', '.scf', '.lnk', '.app', '.deb', '.rpm'
];

const DANGEROUS_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-winexe',
  'application/x-winhlp',
  'application/x-msi',
  'application/java-archive'
];

const RECEIPT_FILENAME_PATTERNS = [
  /receipt/i,
  /invoice/i,
  /bill/i,
  /statement/i,
  /payment/i,
  /purchase/i,
  /order/i,
  /transaction/i
];

// ============================================================================
// Attachment Validator Service
// ============================================================================

export class AttachmentValidator {
  private config: Required<ValidationConfig>;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate single attachment
   */
  async validateAttachment(attachment: AttachmentInfo): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let confidence = 0;

    // Basic validation
    this.validateBasicProperties(attachment, issues);

    // Security validation
    if (this.config.enableSecurityChecks) {
      this.validateSecurity(attachment, issues);
    }

    // File type validation
    this.validateFileType(attachment, issues);

    // Size validation
    this.validateSize(attachment, issues);

    // Receipt-specific validation
    let isReceiptCandidate = false;
    if (this.config.enableReceiptValidation) {
      const receiptAnalysis = this.analyzeReceiptPotential(attachment);
      isReceiptCandidate = receiptAnalysis.isCandidate;
      confidence = receiptAnalysis.confidence;
    }

    // Determine overall validity
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const isValid = criticalIssues.length === 0 && highIssues.length === 0;

    // Generate metadata
    const metadata = this.generateMetadata(attachment, issues, isReceiptCandidate);

    return {
      isValid,
      isReceiptCandidate,
      confidence,
      issues,
      metadata
    };
  }

  /**
   * Validate multiple attachments
   */
  async validateAttachments(attachments: AttachmentInfo[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const attachment of attachments) {
      try {
        const result = await this.validateAttachment(attachment);
        results.push(result);
      } catch (error) {
        // Create error result for failed validation
        results.push({
          isValid: false,
          isReceiptCandidate: false,
          confidence: 0,
          issues: [{
            type: 'content',
            severity: 'critical',
            message: `Validation failed: ${error}`,
            code: 'VALIDATION_ERROR'
          }],
          metadata: {
            fileType: 'unknown',
            estimatedContent: 'unknown',
            securityRisk: 'high',
            processingRecommendation: 'reject'
          }
        });
      }
    }

    return results;
  }

  /**
   * Filter attachments to only valid receipt candidates
   */
  async getValidReceiptAttachments(attachments: AttachmentInfo[]): Promise<ValidatedAttachment[]> {
    const validationResults = await this.validateAttachments(attachments);
    const validAttachments: ValidatedAttachment[] = [];

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      const validation = validationResults[i];

      if (validation.isValid && validation.isReceiptCandidate) {
        validAttachments.push({
          attachmentId: attachment.attachmentId,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          size: attachment.size,
          isReceiptCandidate: true,
          confidence: validation.confidence
        });
      }
    }

    return validAttachments;
  }

  // ============================================================================
  // Private Validation Methods
  // ============================================================================

  /**
   * Validate basic attachment properties
   */
  private validateBasicProperties(attachment: AttachmentInfo, issues: ValidationIssue[]): void {
    if (!attachment.attachmentId) {
      issues.push({
        type: 'content',
        severity: 'critical',
        message: 'Missing attachment ID',
        code: 'MISSING_ID'
      });
    }

    if (!attachment.filename || attachment.filename.trim() === '') {
      issues.push({
        type: 'content',
        severity: 'high',
        message: 'Missing or empty filename',
        code: 'MISSING_FILENAME'
      });
    }

    if (!attachment.mimeType) {
      issues.push({
        type: 'format',
        severity: 'medium',
        message: 'Missing MIME type',
        code: 'MISSING_MIME_TYPE'
      });
    }
  }

  /**
   * Validate security aspects
   */
  private validateSecurity(attachment: AttachmentInfo, issues: ValidationIssue[]): void {
    const filename = attachment.filename.toLowerCase();
    const mimeType = attachment.mimeType.toLowerCase();

    // Check dangerous extensions
    const hasDangerousExtension = DANGEROUS_EXTENSIONS.some(ext => filename.endsWith(ext));
    if (hasDangerousExtension) {
      issues.push({
        type: 'security',
        severity: 'critical',
        message: 'Potentially dangerous file extension',
        code: 'DANGEROUS_EXTENSION'
      });
    }

    // Check dangerous MIME types
    if (DANGEROUS_MIME_TYPES.includes(mimeType)) {
      issues.push({
        type: 'security',
        severity: 'critical',
        message: 'Potentially dangerous MIME type',
        code: 'DANGEROUS_MIME_TYPE'
      });
    }

    // Check for suspicious filename patterns
    if (this.hasSuspiciousPattern(filename)) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: 'Suspicious filename pattern detected',
        code: 'SUSPICIOUS_PATTERN'
      });
    }
  }

  /**
   * Validate file type
   */
  private validateFileType(attachment: AttachmentInfo, issues: ValidationIssue[]): void {
    const mimeType = attachment.mimeType.toLowerCase();
    const filename = attachment.filename.toLowerCase();

    // Check allowed MIME types
    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      issues.push({
        type: 'format',
        severity: 'medium',
        message: `Unsupported MIME type: ${mimeType}`,
        code: 'UNSUPPORTED_MIME_TYPE'
      });
    }

    // Check allowed extensions
    const hasAllowedExtension = this.config.allowedExtensions.some(ext => 
      filename.endsWith(ext)
    );
    if (!hasAllowedExtension) {
      issues.push({
        type: 'format',
        severity: 'medium',
        message: 'Unsupported file extension',
        code: 'UNSUPPORTED_EXTENSION'
      });
    }
  }

  /**
   * Validate file size
   */
  private validateSize(attachment: AttachmentInfo, issues: ValidationIssue[]): void {
    if (attachment.size <= 0) {
      issues.push({
        type: 'content',
        severity: 'high',
        message: 'Empty file',
        code: 'EMPTY_FILE'
      });
    } else if (attachment.size > this.config.maxFileSize) {
      issues.push({
        type: 'size',
        severity: 'high',
        message: `File too large: ${attachment.size} bytes (max: ${this.config.maxFileSize})`,
        code: 'FILE_TOO_LARGE'
      });
    }
  }

  /**
   * Analyze receipt potential
   */
  private analyzeReceiptPotential(attachment: AttachmentInfo): {
    isCandidate: boolean;
    confidence: number;
  } {
    let confidence = 0;
    const filename = attachment.filename.toLowerCase();
    const mimeType = attachment.mimeType.toLowerCase();

    // Check filename patterns
    const hasReceiptPattern = RECEIPT_FILENAME_PATTERNS.some(pattern => 
      pattern.test(filename)
    );
    if (hasReceiptPattern) {
      confidence += 0.6;
    }

    // Check MIME type suitability
    if (mimeType === 'application/pdf') {
      confidence += 0.4;
    } else if (mimeType.startsWith('image/')) {
      confidence += 0.3;
    }

    // Check file size (receipts are usually reasonable size)
    if (attachment.size > 1024 && attachment.size < 5 * 1024 * 1024) { // 1KB to 5MB
      confidence += 0.2;
    }

    // Check for common receipt keywords in filename
    const receiptKeywords = ['receipt', 'invoice', 'bill', 'payment', 'purchase'];
    const keywordMatches = receiptKeywords.filter(keyword => 
      filename.includes(keyword)
    ).length;
    confidence += keywordMatches * 0.1;

    return {
      isCandidate: confidence > 0.5,
      confidence: Math.min(confidence, 1.0)
    };
  }

  /**
   * Generate attachment metadata
   */
  private generateMetadata(
    attachment: AttachmentInfo, 
    issues: ValidationIssue[],
    isReceiptCandidate: boolean
  ): AttachmentMetadata {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const securityIssues = issues.filter(issue => issue.type === 'security');

    // Determine file type
    let fileType = 'unknown';
    if (attachment.mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (attachment.mimeType === 'application/pdf') {
      fileType = 'pdf';
    }

    // Estimate content type
    let estimatedContent: AttachmentMetadata['estimatedContent'] = 'unknown';
    if (isReceiptCandidate) {
      estimatedContent = 'receipt';
    } else if (fileType === 'image') {
      estimatedContent = 'image';
    } else if (fileType === 'pdf') {
      estimatedContent = 'document';
    }

    // Assess security risk
    let securityRisk: AttachmentMetadata['securityRisk'] = 'none';
    if (securityIssues.length > 0) {
      const highSecurityIssues = securityIssues.filter(issue => 
        issue.severity === 'critical' || issue.severity === 'high'
      );
      if (highSecurityIssues.length > 0) {
        securityRisk = 'high';
      } else {
        securityRisk = 'medium';
      }
    } else if (issues.length > 0) {
      securityRisk = 'low';
    }

    // Processing recommendation
    let processingRecommendation: AttachmentMetadata['processingRecommendation'] = 'process';
    if (criticalIssues.length > 0 || securityRisk === 'high') {
      processingRecommendation = 'reject';
    } else if (securityRisk === 'medium' || !isReceiptCandidate) {
      processingRecommendation = 'manual_review';
    }

    return {
      fileType,
      estimatedContent,
      securityRisk,
      processingRecommendation
    };
  }

  /**
   * Check for suspicious filename patterns
   */
  private hasSuspiciousPattern(filename: string): boolean {
    const suspiciousPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /\.(pdf|jpg|png)\.exe$/i, // Double extension with executable
      /^[a-f0-9]{32}$/i, // MD5-like hash as filename
      /^\..+/, // Hidden files (starting with dot)
      /[\x00-\x1f]/, // Control characters
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }
}