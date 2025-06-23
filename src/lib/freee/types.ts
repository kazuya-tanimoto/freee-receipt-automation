/**
 * freee API Integration Types
 * 
 * Type definitions for freee accounting system integration including
 * business categories, transaction types, and API responses.
 */

// ============================================================================
// Business Category Types
// ============================================================================

export enum BusinessCategory {
  TRAVEL_TRANSPORTATION = 'TRAVEL_TRANSPORTATION',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  SOFTWARE_TOOLS = 'SOFTWARE_TOOLS',
  MARKETING_ADVERTISING = 'MARKETING_ADVERTISING',
  MEALS_ENTERTAINMENT = 'MEALS_ENTERTAINMENT',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  OTHER = 'OTHER'
}

export interface BusinessCategoryInfo {
  category: BusinessCategory;
  displayName: string;
  description: string;
  keywords: string[];
  freeeAccountItemId?: number;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface FreeeTransaction {
  id: number;
  issueDate: string;
  amount: number;
  description: string;
  accountItemId: number;
  categoryId?: number;
  partnerId?: number;
  receiptId?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const BUSINESS_CATEGORY_INFO: Record<BusinessCategory, BusinessCategoryInfo> = {
  [BusinessCategory.TRAVEL_TRANSPORTATION]: {
    category: BusinessCategory.TRAVEL_TRANSPORTATION,
    displayName: '旅費交通費',
    description: 'Travel and transportation expenses',
    keywords: ['travel', 'trip', 'flight', 'hotel', 'uber', 'taxi', 'transport', 'airline'],
    freeeAccountItemId: 1
  },
  [BusinessCategory.OFFICE_SUPPLIES]: {
    category: BusinessCategory.OFFICE_SUPPLIES,
    displayName: '事務用品費',
    description: 'Office supplies and equipment',
    keywords: ['office', 'supplies', 'paper', 'pen', 'desk', 'equipment', 'stationery'],
    freeeAccountItemId: 2
  },
  [BusinessCategory.SOFTWARE_TOOLS]: {
    category: BusinessCategory.SOFTWARE_TOOLS,
    displayName: 'ソフトウェア費',
    description: 'Software tools and subscriptions',
    keywords: ['software', 'license', 'subscription', 'saas', 'tool', 'app', 'service'],
    freeeAccountItemId: 3
  },
  [BusinessCategory.MARKETING_ADVERTISING]: {
    category: BusinessCategory.MARKETING_ADVERTISING,
    displayName: '広告宣伝費',
    description: 'Marketing and advertising expenses',
    keywords: ['marketing', 'advertising', 'ads', 'promotion', 'campaign', 'social media'],
    freeeAccountItemId: 4
  },
  [BusinessCategory.MEALS_ENTERTAINMENT]: {
    category: BusinessCategory.MEALS_ENTERTAINMENT,
    displayName: '会議費',
    description: 'Meals and entertainment expenses',
    keywords: ['restaurant', 'meal', 'dinner', 'lunch', 'food', 'entertainment', 'event'],
    freeeAccountItemId: 5
  },
  [BusinessCategory.PROFESSIONAL_SERVICES]: {
    category: BusinessCategory.PROFESSIONAL_SERVICES,
    displayName: '支払手数料',
    description: 'Professional services and consulting',
    keywords: ['consulting', 'legal', 'accounting', 'professional', 'service', 'advisory'],
    freeeAccountItemId: 6
  },
  [BusinessCategory.OTHER]: {
    category: BusinessCategory.OTHER,
    displayName: 'その他',
    description: 'Other miscellaneous expenses',
    keywords: ['other', 'miscellaneous', 'general', 'expense'],
    freeeAccountItemId: 7
  }
};