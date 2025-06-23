/**
 * Receipt Detection Processor
 * 
 * Intelligent receipt detection with confidence scoring, business category
 * classification, and comprehensive analysis of email content and attachments.
 */

import { BusinessCategory } from '../../freee/types';
import { ProcessedEmail, AttachmentInfo } from '../types';
import { getEmailString, getEmailName } from '../utils/email-helpers';

// ============================================================================
// Types
// ============================================================================

export interface ReceiptDetectionConfig {
  minConfidenceScore?: number;
  enableAttachmentAnalysis?: boolean;
  enableContentAnalysis?: boolean;
  attachmentSizeLimit?: number;
}

export interface ReceiptDetectionResult {
  isReceipt: boolean;
  confidence: number;
  category: BusinessCategory;
  indicators: ReceiptIndicator[];
  attachments: ValidatedAttachment[];
  metadata: ReceiptMetadata;
}

export interface ReceiptIndicator {
  type: 'subject' | 'sender' | 'content' | 'attachment';
  description: string;
  confidence: number;
  weight: number;
}

export interface ValidatedAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  isReceiptCandidate: boolean;
  confidence: number;
}

export interface ReceiptMetadata {
  estimatedAmount?: number;
  currency?: string;
  vendor?: string;
  date?: Date;
  category?: BusinessCategory;
}

interface InternalReceiptDetectionConfig {
  minConfidenceScore: number;
  enableAttachmentAnalysis: boolean;
  enableContentAnalysis: boolean;
  attachmentSizeLimit: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: InternalReceiptDetectionConfig = {
  minConfidenceScore: 0.6,
  enableAttachmentAnalysis: true,
  enableContentAnalysis: true,
  attachmentSizeLimit: 25 * 1024 * 1024 // 25MB
};

const RECEIPT_KEYWORDS = [
  'receipt', 'invoice', 'payment', 'purchase', 'order', 'transaction',
  'billing', 'charge', 'expense', 'refund', 'confirmation'
];

const BUSINESS_VENDORS = [
  'amazon', 'stripe', 'paypal', 'square', 'uber', 'lyft', 'github',
  'microsoft', 'google', 'adobe', 'slack', 'zoom', 'dropbox'
];

// ============================================================================
// Receipt Detection Service
// ============================================================================

export class ReceiptDetector {
  private config: InternalReceiptDetectionConfig;
  private categoryKeywords: Record<BusinessCategory, string[]>;

  constructor(config: Partial<InternalReceiptDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.categoryKeywords = {} as Record<BusinessCategory, string[]>;
    this.initializeCategoryKeywords();
  }

  /**
   * Detect if email is a receipt with confidence scoring
   */
  async detectReceipt(email: ProcessedEmail): Promise<ReceiptDetectionResult> {
    const indicators: ReceiptIndicator[] = [];
    let totalConfidence = 0;
    let indicatorCount = 0;

    // Analyze subject line
    const subjectAnalysis = this.analyzeSubject(email.subject);
    if (subjectAnalysis.confidence > 0) {
      indicators.push(subjectAnalysis);
      totalConfidence += subjectAnalysis.confidence * subjectAnalysis.weight;
      indicatorCount += subjectAnalysis.weight;
    }

    // Analyze sender
    const fromEmail = getEmailString(email.from);
    const fromName = getEmailName(email.from);
    const senderIndicators = this.analyzeSender(fromEmail, fromName);
    if (senderIndicators.length > 0) {
      indicators.push(...senderIndicators);
      senderIndicators.forEach(indicator => {
        totalConfidence += indicator.confidence * indicator.weight;
        indicatorCount += indicator.weight;
      });
    }

    // Analyze content if enabled
    if (this.config.enableContentAnalysis && email.body) {
      const contentAnalysis = this.analyzeContent(email.body);
      if (contentAnalysis.confidence > 0) {
        indicators.push(contentAnalysis);
        totalConfidence += contentAnalysis.confidence * contentAnalysis.weight;
        indicatorCount += contentAnalysis.weight;
      }
    }

    // Analyze attachments if enabled
    let validatedAttachments: ValidatedAttachment[] = [];
    if (this.config.enableAttachmentAnalysis && email.attachments) {
      const attachmentAnalysis = this.analyzeAttachments(email.attachments);
      validatedAttachments = attachmentAnalysis.attachments;
      
      if (attachmentAnalysis.indicators.length > 0) {
        indicators.push(...attachmentAnalysis.indicators);
        attachmentAnalysis.indicators.forEach(indicator => {
          totalConfidence += indicator.confidence * indicator.weight;
          indicatorCount += indicator.weight;
        });
      }
    }

    // Calculate final confidence
    const finalConfidence = indicatorCount > 0 ? totalConfidence / indicatorCount : 0;
    const isReceipt = finalConfidence >= this.config.minConfidenceScore;

    // Determine category
    const category = this.determineCategory(email, indicators);

    // Extract metadata
    const metadata = this.extractMetadata(email);

    return {
      isReceipt,
      confidence: finalConfidence,
      category,
      indicators,
      attachments: validatedAttachments,
      metadata
    };
  }

  /**
   * Initialize category keywords
   */
  private initializeCategoryKeywords(): void {
    this.categoryKeywords = {
      [BusinessCategory.TRAVEL_TRANSPORTATION]: [
        'travel', 'trip', 'flight', 'hotel', 'uber', 'lyft', 'taxi', 'airline', 'booking'
      ],
      [BusinessCategory.OFFICE_SUPPLIES]: [
        'office', 'supplies', 'paper', 'pen', 'desk', 'equipment', 'amazon', 'staples'
      ],
      [BusinessCategory.SOFTWARE_TOOLS]: [
        'software', 'license', 'subscription', 'saas', 'github', 'slack', 'zoom', 'microsoft'
      ],
      [BusinessCategory.MARKETING_ADVERTISING]: [
        'marketing', 'advertising', 'ads', 'google', 'facebook', 'linkedin', 'campaign'
      ],
      [BusinessCategory.MEALS_ENTERTAINMENT]: [
        'restaurant', 'meal', 'food', 'dinner', 'lunch', 'entertainment', 'grubhub', 'doordash'
      ],
      [BusinessCategory.PROFESSIONAL_SERVICES]: [
        'consulting', 'legal', 'accounting', 'professional', 'service', 'advisory'
      ],
      [BusinessCategory.OTHER]: [
        'expense', 'purchase', 'payment', 'transaction'
      ]
    };
  }

  /**
   * Analyze subject line for receipt indicators
   */
  private analyzeSubject(subject: string): ReceiptIndicator {
    const lowerSubject = subject.toLowerCase();
    let confidence = 0;
    let matchedKeywords: string[] = [];

    // Check for receipt keywords
    for (const keyword of RECEIPT_KEYWORDS) {
      if (lowerSubject.includes(keyword)) {
        confidence += 0.3;
        matchedKeywords.push(keyword);
      }
    }

    // Check for amount patterns
    const amountPattern = /\$\d+(\.\d{2})?|\d+\.\d{2}\s*(usd|eur|jpy|yen)/i;
    if (amountPattern.test(subject)) {
      confidence += 0.4;
      matchedKeywords.push('amount');
    }

    // Check for order/confirmation numbers
    const orderPattern = /#\d+|order\s*#?\s*\d+|confirmation\s*#?\s*\d+/i;
    if (orderPattern.test(subject)) {
      confidence += 0.3;
      matchedKeywords.push('order_number');
    }

    return {
      type: 'subject',
      description: `Subject analysis: ${matchedKeywords.join(', ')}`,
      confidence: Math.min(confidence, 1.0),
      weight: 1.0
    };
  }

  /**
   * Analyze sender for business indicators
   */
  private analyzeSender(email: string, name: string): ReceiptIndicator[] {
    const indicators: ReceiptIndicator[] = [];
    const lowerEmail = email.toLowerCase();
    const lowerName = name.toLowerCase();

    // Check known business vendors
    for (const vendor of BUSINESS_VENDORS) {
      if (lowerEmail.includes(vendor) || lowerName.includes(vendor)) {
        indicators.push({
          type: 'sender',
          description: `Known business vendor: ${vendor}`,
          confidence: 0.8,
          weight: 1.2
        });
      }
    }

    // Check for business email patterns
    const businessPatterns = [
      /noreply|no-reply/i,
      /receipts?|billing|payments?|orders?/i,
      /support|help|customer/i
    ];

    for (const pattern of businessPatterns) {
      if (pattern.test(email) || pattern.test(name)) {
        indicators.push({
          type: 'sender',
          description: `Business email pattern detected`,
          confidence: 0.6,
          weight: 0.8
        });
        break; // Only add one business pattern indicator
      }
    }

    return indicators;
  }

  /**
   * Analyze email content for receipt indicators
   */
  private analyzeContent(content: string): ReceiptIndicator {
    const lowerContent = content.toLowerCase();
    let confidence = 0;
    let matchedIndicators: string[] = [];

    // Check for receipt language
    const receiptPhrases = [
      'thank you for your purchase',
      'payment confirmation',
      'transaction details',
      'order summary',
      'billing information',
      'receipt attached'
    ];

    for (const phrase of receiptPhrases) {
      if (lowerContent.includes(phrase)) {
        confidence += 0.2;
        matchedIndicators.push(phrase);
      }
    }

    // Check for structured data
    if (lowerContent.includes('total:') || lowerContent.includes('amount:')) {
      confidence += 0.3;
      matchedIndicators.push('structured_amount');
    }

    // Check for tax information
    if (lowerContent.includes('tax') && lowerContent.includes('$')) {
      confidence += 0.2;
      matchedIndicators.push('tax_info');
    }

    return {
      type: 'content',
      description: `Content analysis: ${matchedIndicators.join(', ')}`,
      confidence: Math.min(confidence, 1.0),
      weight: 0.8
    };
  }

  /**
   * Analyze attachments for receipt files
   */
  private analyzeAttachments(attachments: AttachmentInfo[]): {
    attachments: ValidatedAttachment[];
    indicators: ReceiptIndicator[];
  } {
    const validatedAttachments: ValidatedAttachment[] = [];
    const indicators: ReceiptIndicator[] = [];

    for (const attachment of attachments) {
      let confidence = 0;
      const filename = attachment.filename.toLowerCase();

      // Check file type
      if (attachment.mimeType === 'application/pdf') {
        confidence += 0.7;
      } else if (attachment.mimeType.startsWith('image/')) {
        confidence += 0.5;
      }

      // Check filename patterns
      const receiptFilenames = ['receipt', 'invoice', 'bill', 'statement'];
      for (const pattern of receiptFilenames) {
        if (filename.includes(pattern)) {
          confidence += 0.6;
          break;
        }
      }

      // Check size (receipts are usually reasonable size)
      if (attachment.size > 0 && attachment.size < this.config.attachmentSizeLimit) {
        confidence += 0.2;
      }

      const isReceiptCandidate = confidence > 0.5;

      validatedAttachments.push({
        attachmentId: attachment.attachmentId,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        size: attachment.size,
        isReceiptCandidate,
        confidence
      });

      if (isReceiptCandidate) {
        indicators.push({
          type: 'attachment',
          description: `Receipt-like attachment: ${attachment.filename}`,
          confidence,
          weight: 1.0
        });
      }
    }

    return { attachments: validatedAttachments, indicators };
  }

  /**
   * Determine business category based on indicators
   */
  private determineCategory(email: ProcessedEmail, indicators: ReceiptIndicator[]): BusinessCategory {
    const categoryScores = new Map<BusinessCategory, number>();

    // Initialize all categories
    Object.values(BusinessCategory).forEach(category => {
      categoryScores.set(category, 0);
    });

    // Analyze email content for category keywords
    const content = `${email.subject} ${email.body || ''} ${getEmailString(email.from)}`.toLowerCase();

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const businessCategory = category as BusinessCategory;
      let score = 0;

      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          score += 1;
        }
      }

      if (score > 0) {
        categoryScores.set(businessCategory, score);
      }
    }

    // Find category with highest score
    let bestCategory = BusinessCategory.OTHER;
    let bestScore = 0;

    for (const [category, score] of Array.from(categoryScores.entries())) {
      if (score > bestScore) {
        bestCategory = category;
        bestScore = score;
      }
    }

    return bestCategory;
  }

  /**
   * Extract receipt metadata
   */
  private extractMetadata(email: ProcessedEmail): ReceiptMetadata {
    const metadata: ReceiptMetadata = {};
    const content = `${email.subject} ${email.body || ''}`;

    // Extract amount
    const amountMatch = content.match(/\$(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      metadata.estimatedAmount = parseFloat(amountMatch[1]);
      metadata.currency = 'USD';
    }

    // Extract vendor from sender
    const fromEmail = getEmailString(email.from);
    const fromName = getEmailName(email.from);
    const domain = fromEmail.split('@')[1]?.toLowerCase();
    
    if (domain) {
      // Extract company name from domain
      const companyName = domain.split('.')[0];
      metadata.vendor = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    } else if (fromName) {
      metadata.vendor = fromName;
    }

    // Use email date
    metadata.date = email.date;

    return metadata;
  }
}