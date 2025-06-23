/**
 * Email Classification Processor
 * 
 * Advanced email classification system for business expense categorization
 * with vendor recognition, keyword analysis, and confidence scoring.
 */

import { BusinessCategory } from '../../freee/types';
import { getEmailString, getEmailName } from '../utils/email-helpers';

// ============================================================================
// Types
// ============================================================================

export interface ClassificationInput {
  from: string;
  subject: string;
  body?: string;
  snippet?: string;
}

export interface ClassificationResult {
  category: BusinessCategory;
  confidence: number;
  reasoning: string[];
  alternativeCategories: Array<{
    category: BusinessCategory;
    confidence: number;
  }>;
}

interface KeywordMapping {
  keywords: string[];
  weight: number;
}

// ============================================================================
// Email Classifier Service
// ============================================================================

export class EmailClassifier {
  private categoryKeywords: Map<BusinessCategory, KeywordMapping>;
  private vendorMappings: Map<string, BusinessCategory>;
  private confidenceThreshold = 0.3;

  constructor() {
    this.categoryKeywords = new Map();
    this.vendorMappings = new Map();
    this.initializeKeywords();
    this.initializeVendorMappings();
  }

  /**
   * Classify email by business category
   */
  async classifyEmail(input: ClassificationInput): Promise<ClassificationResult> {
    const scores = new Map<BusinessCategory, number>();
    
    // Initialize all categories with 0 score
    Object.values(BusinessCategory).forEach(category => {
      scores.set(category, 0);
    });

    // Check vendor mappings first
    const vendorScore = this.checkVendorMapping(input.from);
    if (vendorScore) {
      scores.set(vendorScore.category, vendorScore.confidence);
    }

    // Analyze subject line
    const subjectScores = this.analyzeText(input.subject);
    this.mergeScores(scores, subjectScores);

    // Analyze body/snippet if available
    const bodyText = input.body || input.snippet || '';
    if (bodyText) {
      const bodyScores = this.analyzeText(bodyText);
      this.mergeScores(scores, bodyScores, 0.7); // Slightly lower weight for body
    }

    // Find best match
    const sortedScores = Array.from(scores.entries())
      .sort(([, a], [, b]) => b - a);
    
    const [bestCategory, bestScore] = sortedScores[0];
    const alternativeCategories = sortedScores
      .slice(1, 4)
      .filter(([, score]) => score > 0.1)
      .map(([category, confidence]) => ({ category, confidence }));

    // Generate reasoning
    const reasoning = this.generateReasoning(input, bestCategory, bestScore);

    return {
      category: bestCategory,
      confidence: Math.min(bestScore, 1.0),
      reasoning,
      alternativeCategories
    };
  }

  /**
   * Initialize category keywords
   */
  private initializeKeywords(): void {
    this.categoryKeywords.set(BusinessCategory.TRAVEL_TRANSPORTATION, {
      keywords: ['travel', 'trip', 'flight', 'hotel', 'uber', 'taxi', 'transport', 'airline'],
      weight: 1.0
    });

    this.categoryKeywords.set(BusinessCategory.OFFICE_SUPPLIES, {
      keywords: ['office', 'supplies', 'paper', 'pen', 'desk', 'equipment', 'stationery'],
      weight: 1.0
    });

    this.categoryKeywords.set(BusinessCategory.SOFTWARE_TOOLS, {
      keywords: ['software', 'license', 'subscription', 'saas', 'tool', 'app', 'service'],
      weight: 1.0
    });

    this.categoryKeywords.set(BusinessCategory.MARKETING_ADVERTISING, {
      keywords: ['marketing', 'advertising', 'ads', 'promotion', 'campaign', 'social media'],
      weight: 1.0
    });

    this.categoryKeywords.set(BusinessCategory.MEALS_ENTERTAINMENT, {
      keywords: ['restaurant', 'meal', 'dinner', 'lunch', 'food', 'entertainment', 'event'],
      weight: 1.0
    });

    this.categoryKeywords.set(BusinessCategory.PROFESSIONAL_SERVICES, {
      keywords: ['consulting', 'legal', 'accounting', 'professional', 'service', 'advisory'],
      weight: 1.0
    });

    this.categoryKeywords.set(BusinessCategory.OTHER, {
      keywords: ['other', 'miscellaneous', 'general', 'expense'],
      weight: 0.5
    });
  }

  /**
   * Initialize vendor mappings
   */
  private initializeVendorMappings(): void {
    // Travel & Transportation
    this.vendorMappings.set('uber.com', BusinessCategory.TRAVEL_TRANSPORTATION);
    this.vendorMappings.set('lyft.com', BusinessCategory.TRAVEL_TRANSPORTATION);
    this.vendorMappings.set('booking.com', BusinessCategory.TRAVEL_TRANSPORTATION);
    this.vendorMappings.set('expedia.com', BusinessCategory.TRAVEL_TRANSPORTATION);

    // Software & Tools
    this.vendorMappings.set('github.com', BusinessCategory.SOFTWARE_TOOLS);
    this.vendorMappings.set('slack.com', BusinessCategory.SOFTWARE_TOOLS);
    this.vendorMappings.set('zoom.us', BusinessCategory.SOFTWARE_TOOLS);
    this.vendorMappings.set('microsoft.com', BusinessCategory.SOFTWARE_TOOLS);

    // Office Supplies
    this.vendorMappings.set('amazon.com', BusinessCategory.OFFICE_SUPPLIES);
    this.vendorMappings.set('staples.com', BusinessCategory.OFFICE_SUPPLIES);
    this.vendorMappings.set('officedepot.com', BusinessCategory.OFFICE_SUPPLIES);

    // Marketing & Advertising
    this.vendorMappings.set('google.com', BusinessCategory.MARKETING_ADVERTISING);
    this.vendorMappings.set('facebook.com', BusinessCategory.MARKETING_ADVERTISING);
    this.vendorMappings.set('linkedin.com', BusinessCategory.MARKETING_ADVERTISING);
  }

  /**
   * Check vendor mapping
   */
  private checkVendorMapping(from: string): { category: BusinessCategory; confidence: number } | null {
    const email = from.toLowerCase();
    
    for (const [domain, category] of Array.from(this.vendorMappings.entries())) {
      if (email.includes(domain)) {
        return { category, confidence: 0.8 };
      }
    }

    return null;
  }

  /**
   * Analyze text for category keywords
   */
  private analyzeText(text: string): Map<BusinessCategory, number> {
    const scores = new Map<BusinessCategory, number>();
    const lowerText = text.toLowerCase();

    for (const [category, mapping] of Array.from(this.categoryKeywords.entries())) {
      let score = 0;
      
      for (const keyword of mapping.keywords) {
        if (lowerText.includes(keyword)) {
          score += mapping.weight;
        }
      }

      if (score > 0) {
        scores.set(category, score / mapping.keywords.length);
      }
    }

    return scores;
  }

  /**
   * Merge scores with weights
   */
  private mergeScores(
    target: Map<BusinessCategory, number>,
    source: Map<BusinessCategory, number>,
    weight = 1.0
  ): void {
    for (const [category, score] of Array.from(source.entries())) {
      const currentScore = target.get(category) || 0;
      target.set(category, currentScore + (score * weight));
    }
  }

  /**
   * Generate reasoning for classification
   */
  private generateReasoning(
    input: ClassificationInput,
    category: BusinessCategory,
    confidence: number
  ): string[] {
    const reasoning: string[] = [];

    // Check vendor match
    const vendorMatch = this.checkVendorMapping(input.from);
    if (vendorMatch && vendorMatch.category === category) {
      reasoning.push(`Sender domain matches known ${category} vendor`);
    }

    // Check keyword matches
    const keywords = this.categoryKeywords.get(category);
    if (keywords) {
      const subjectMatches = keywords.keywords.filter(k => 
        input.subject.toLowerCase().includes(k)
      );
      
      if (subjectMatches.length > 0) {
        reasoning.push(`Subject contains ${category} keywords: ${subjectMatches.join(', ')}`);
      }
    }

    // Confidence level
    if (confidence > 0.7) {
      reasoning.push('High confidence match');
    } else if (confidence > 0.4) {
      reasoning.push('Medium confidence match');
    } else {
      reasoning.push('Low confidence match - manual review recommended');
    }

    return reasoning;
  }
}