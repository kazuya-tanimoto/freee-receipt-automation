/**
 * Gmail Processors Module
 * 
 * Centralized exports for all Gmail processing components including
 * receipt detection, email classification, and attachment validation.
 */

export { ReceiptDetector } from './receipt-detector';
export { EmailClassifier } from './email-classifier';
export { AttachmentValidator } from './attachment-validator';

// Re-export types for convenience
export type {
  ReceiptDetectionConfig,
  ReceiptDetectionResult,
  ReceiptIndicator,
  ValidatedAttachment,
  ReceiptMetadata
} from './receipt-detector';

export type {
  ClassificationInput,
  ClassificationResult
} from './email-classifier';

export type {
  ValidationConfig,
  ValidationResult,
  ValidationIssue,
  AttachmentMetadata
} from './attachment-validator';

/**
 * Gmail Processing Pipeline
 * 
 * Unified processing pipeline that combines receipt detection,
 * email classification, and attachment validation.
 */
import { ProcessedEmail } from '../types';
import { BusinessCategory } from '../../freee/types';
import { ReceiptDetector } from './receipt-detector';
import { EmailClassifier } from './email-classifier';
import { AttachmentValidator } from './attachment-validator';

export interface ProcessingPipelineConfig {
  receipt?: Partial<import('./receipt-detector').ReceiptDetectionConfig>;
  validation?: Partial<import('./attachment-validator').ValidationConfig>;
  enableClassification?: boolean;
}

export interface ProcessingPipelineResult {
  email: ProcessedEmail;
  receiptDetection: import('./receipt-detector').ReceiptDetectionResult;
  classification: import('./email-classifier').ClassificationResult;
  attachmentValidation: import('./attachment-validator').ValidationResult[];
  overallConfidence: number;
  recommendation: 'process' | 'manual_review' | 'skip';
}

export class GmailProcessingPipeline {
  private receiptDetector: ReceiptDetector;
  private emailClassifier: EmailClassifier;
  private attachmentValidator: AttachmentValidator;

  constructor(config: ProcessingPipelineConfig = {}) {
    this.receiptDetector = new ReceiptDetector(config.receipt);
    this.emailClassifier = new EmailClassifier();
    this.attachmentValidator = new AttachmentValidator(config.validation);
  }

  /**
   * Process email through complete pipeline
   */
  async processEmail(email: ProcessedEmail): Promise<ProcessingPipelineResult> {
    // Receipt detection
    const receiptDetection = await this.receiptDetector.detectReceipt(email);

    // Email classification
    const classification = await this.emailClassifier.classifyEmail({
      from: typeof email.from === 'string' ? email.from : email.from.email,
      subject: email.subject,
      body: email.body,
      snippet: email.snippet
    });

    // Attachment validation
    let attachmentValidation: import('./attachment-validator').ValidationResult[] = [];
    if (email.attachments && email.attachments.length > 0) {
      attachmentValidation = await this.attachmentValidator.validateAttachments(email.attachments);
    }

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      receiptDetection,
      classification,
      attachmentValidation
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      receiptDetection,
      classification,
      attachmentValidation,
      overallConfidence
    );

    return {
      email,
      receiptDetection,
      classification,
      attachmentValidation,
      overallConfidence,
      recommendation
    };
  }

  /**
   * Batch process multiple emails
   */
  async processEmails(emails: ProcessedEmail[]): Promise<ProcessingPipelineResult[]> {
    const results: ProcessingPipelineResult[] = [];

    for (const email of emails) {
      try {
        const result = await this.processEmail(email);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process email ${email.messageId}:`, error);
        // Continue with next email
      }
    }

    return results;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    receiptDetection: import('./receipt-detector').ReceiptDetectionResult,
    classification: import('./email-classifier').ClassificationResult,
    attachmentValidation: import('./attachment-validator').ValidationResult[]
  ): number {
    let totalWeight = 0;
    let weightedScore = 0;

    // Receipt detection (40% weight)
    const receiptWeight = 0.4;
    totalWeight += receiptWeight;
    weightedScore += receiptDetection.confidence * receiptWeight;

    // Classification (30% weight)
    const classificationWeight = 0.3;
    totalWeight += classificationWeight;
    weightedScore += classification.confidence * classificationWeight;

    // Attachment validation (30% weight)
    if (attachmentValidation.length > 0) {
      const attachmentWeight = 0.3;
      totalWeight += attachmentWeight;
      
      const avgAttachmentConfidence = attachmentValidation
        .reduce((sum, result) => sum + result.confidence, 0) / attachmentValidation.length;
      
      weightedScore += avgAttachmentConfidence * attachmentWeight;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  /**
   * Generate processing recommendation
   */
  private generateRecommendation(
    receiptDetection: import('./receipt-detector').ReceiptDetectionResult,
    classification: import('./email-classifier').ClassificationResult,
    attachmentValidation: import('./attachment-validator').ValidationResult[],
    overallConfidence: number
  ): 'process' | 'manual_review' | 'skip' {
    // Skip if not a receipt with high confidence
    if (!receiptDetection.isReceipt && receiptDetection.confidence < 0.3) {
      return 'skip';
    }

    // Check for critical attachment issues
    const hasCriticalAttachmentIssues = attachmentValidation.some(result =>
      result.issues.some(issue => issue.severity === 'critical')
    );

    if (hasCriticalAttachmentIssues) {
      return 'skip';
    }

    // Check for security issues
    const hasSecurityIssues = attachmentValidation.some(result =>
      result.issues.some(issue => issue.type === 'security' && issue.severity === 'high')
    );

    if (hasSecurityIssues) {
      return 'manual_review';
    }

    // High confidence - process automatically
    if (overallConfidence > 0.8 && receiptDetection.isReceipt) {
      return 'process';
    }

    // Medium confidence - manual review
    if (overallConfidence > 0.5) {
      return 'manual_review';
    }

    // Low confidence - skip
    return 'skip';
  }
}