# PBI-2-4-1: File Naming System

## Description
Implement a comprehensive file naming system for receipt PDFs that generates consistent, meaningful filenames based on receipt content, dates, and vendors. This ensures organized file storage with human-readable names while avoiding conflicts and maintaining consistency across all receipt sources.

## Implementation Details

### Files to Create/Modify
1. `src/lib/file-management/naming-strategy.ts` - Core file naming logic
2. `src/lib/file-management/name-generator.ts` - Name generation utilities
3. `src/lib/file-management/name-sanitizer.ts` - Filename sanitization
4. `src/lib/file-management/types.ts` - File naming types
5. `src/config/naming-rules.ts` - Configurable naming rules
6. `docs/file-management/naming-conventions.md` - Naming documentation

### Technical Requirements
- Generate short, descriptive filenames (max 50 characters base name)
- Include date prefix for chronological organization
- Extract vendor/service names from receipt content
- Sanitize filenames for cross-platform compatibility
- Support configurable naming patterns

### File Naming Strategy
```typescript
export interface NamingConfig {
  maxBaseLength: number;
  dateFormat: 'YYYY-MM-DD' | 'YYYYMMDD' | 'MM-DD';
  includeDatePrefix: boolean;
  vendorExtraction: {
    enabled: boolean;
    maxLength: number;
    fallbackToDescription: boolean;
  };
  sanitization: {
    replaceSpaces: string;
    removeSpecialChars: boolean;
    allowedChars: string;
  };
}

export class FileNamingStrategy {
  constructor(private config: NamingConfig) {}
  
  generateFileName(receipt: ReceiptData): string {
    // 1. Extract base name
    const baseName = this.extractBaseName(receipt);
    
    // 2. Add date prefix if configured
    const nameWithDate = this.config.includeDatePrefix 
      ? this.addDatePrefix(baseName, receipt.date)
      : baseName;
    
    // 3. Sanitize filename
    const sanitized = this.sanitizeFileName(nameWithDate);
    
    // 4. Ensure length limits
    const truncated = this.truncateBaseName(sanitized);
    
    // 5. Add extension
    return this.addExtension(truncated, receipt.fileType);
  }
  
  private extractBaseName(receipt: ReceiptData): string {
    // Priority: vendor > description > OCR content
    if (this.config.vendorExtraction.enabled && receipt.vendor) {
      return this.extractVendorName(receipt.vendor);
    }
    
    if (receipt.description) {
      return this.extractFromDescription(receipt.description);
    }
    
    if (receipt.ocrText) {
      return this.extractFromOCR(receipt.ocrText);
    }
    
    return 'receipt';
  }
  
  private extractVendorName(vendor: string): string {
    // Remove common business suffixes
    const cleanVendor = vendor
      .replace(/\s*(株式会社|有限会社|合同会社|Co\.?\s*Ltd\.?|Inc\.?|Corp\.?|LLC)$/i, '')
      .replace(/\s*(店|ショップ|Shop|Store)$/i, '')
      .trim();
    
    // Take first significant words
    const words = cleanVendor.split(/\s+/).slice(0, 2);
    return words.join('_');
  }
  
  private extractFromDescription(description: string): string {
    // Extract key terms from description
    const keywords = this.extractKeywords(description);
    return keywords.slice(0, 2).join('_') || 'receipt';
  }
  
  private extractFromOCR(ocrText: string): string {
    // Use NLP or pattern matching to extract business names
    const businessPatterns = [
      /(?:株式会社|有限会社)\s*([^\s\n]+)/,
      /([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(?:Inc|Corp|Ltd|LLC)/i,
      /^([^\n]{1,30})/  // First line as fallback
    ];
    
    for (const pattern of businessPatterns) {
      const match = ocrText.match(pattern);
      if (match && match[1]) {
        return this.sanitizeBasicName(match[1]);
      }
    }
    
    return 'receipt';
  }
  
  private addDatePrefix(baseName: string, date: Date): string {
    let dateStr: string;
    
    switch (this.config.dateFormat) {
      case 'YYYY-MM-DD':
        dateStr = date.toISOString().split('T')[0];
        break;
      case 'YYYYMMDD':
        dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        break;
      case 'MM-DD':
        dateStr = date.toISOString().split('T')[0].substring(5);
        break;
    }
    
    return `${dateStr}_${baseName}`;
  }
  
  private sanitizeFileName(fileName: string): string {
    // Remove or replace invalid characters
    let sanitized = fileName;
    
    // Replace spaces
    sanitized = sanitized.replace(/\s+/g, this.config.sanitization.replaceSpaces);
    
    // Remove special characters if configured
    if (this.config.sanitization.removeSpecialChars) {
      const allowedPattern = new RegExp(`[^${this.config.sanitization.allowedChars}]`, 'g');
      sanitized = sanitized.replace(allowedPattern, '');
    }
    
    // Remove multiple consecutive separators
    sanitized = sanitized.replace(/[_-]{2,}/g, '_');
    
    // Remove leading/trailing separators
    sanitized = sanitized.replace(/^[_-]+|[_-]+$/g, '');
    
    return sanitized;
  }
  
  private truncateBaseName(baseName: string): string {
    if (baseName.length <= this.config.maxBaseLength) {
      return baseName;
    }
    
    // Try to truncate at word boundaries
    const truncated = baseName.substring(0, this.config.maxBaseLength);
    const lastSeparator = Math.max(
      truncated.lastIndexOf('_'),
      truncated.lastIndexOf('-')
    );
    
    if (lastSeparator > this.config.maxBaseLength * 0.7) {
      return truncated.substring(0, lastSeparator);
    }
    
    return truncated;
  }
}
```

### Vendor Detection Logic
```typescript
export class VendorDetector {
  private vendorPatterns = {
    japanese: [
      /(?:株式会社|有限会社|合同会社)\s*([^\s\n]{2,20})/g,
      /([^\s\n]{2,20})\s*(?:株式会社|有限会社|合同会社)/g,
      /([^\s\n]{2,20})\s*(?:店|ショップ)/g
    ],
    english: [
      /([A-Za-z][A-Za-z\s]{1,30})\s*(?:Inc\.?|Corp\.?|Ltd\.?|LLC|Co\.?)/gi,
      /([A-Za-z][A-Za-z\s]{1,30})\s*(?:Store|Shop|Market|Mall)/gi
    ],
    email: [
      /from[:\s]+([^@\s]+)@([^.\s]+\.[^.\s]+)/gi,
      /noreply@([^.\s]+\.[^.\s]+)/gi
    ]
  };
  
  extractVendor(content: string, source: 'ocr' | 'email' | 'description'): string | null {
    const patterns = source === 'email' 
      ? this.vendorPatterns.email 
      : [...this.vendorPatterns.japanese, ...this.vendorPatterns.english];
    
    for (const pattern of patterns) {
      const matches = Array.from(content.matchAll(pattern));
      if (matches.length > 0) {
        const vendor = matches[0][1] || matches[0][2];
        if (vendor && vendor.length >= 2) {
          return this.normalizeVendorName(vendor);
        }
      }
    }
    
    return null;
  }
  
  private normalizeVendorName(vendor: string): string {
    return vendor
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 20);
  }
}
```

### Configurable Naming Rules
```typescript
// src/config/naming-rules.ts
export const NAMING_CONFIGS = {
  default: {
    maxBaseLength: 50,
    dateFormat: 'YYYY-MM-DD' as const,
    includeDatePrefix: true,
    vendorExtraction: {
      enabled: true,
      maxLength: 20,
      fallbackToDescription: true
    },
    sanitization: {
      replaceSpaces: '_',
      removeSpecialChars: true,
      allowedChars: 'A-Za-z0-9_\\-'
    }
  },
  compact: {
    maxBaseLength: 30,
    dateFormat: 'MM-DD' as const,
    includeDatePrefix: true,
    vendorExtraction: {
      enabled: true,
      maxLength: 15,
      fallbackToDescription: false
    },
    sanitization: {
      replaceSpaces: '',
      removeSpecialChars: true,
      allowedChars: 'A-Za-z0-9'
    }
  }
} as const;

export function createNamingStrategy(configName: keyof typeof NAMING_CONFIGS = 'default'): FileNamingStrategy {
  return new FileNamingStrategy(NAMING_CONFIGS[configName]);
}
```

### API Integration
```typescript
// Integration with receipt processing
export class ReceiptFileNamer {
  constructor(
    private namingStrategy: FileNamingStrategy,
    private vendorDetector: VendorDetector
  ) {}
  
  async generateFileName(receipt: Receipt): Promise<string> {
    // Enhance receipt data with vendor detection
    const enhancedData: ReceiptData = {
      ...receipt,
      vendor: receipt.vendor || await this.detectVendor(receipt),
      date: receipt.transaction_date || receipt.created_at,
      fileType: this.getFileType(receipt.mime_type)
    };
    
    return this.namingStrategy.generateFileName(enhancedData);
  }
  
  private async detectVendor(receipt: Receipt): Promise<string | null> {
    // Try OCR text first
    if (receipt.ocr_text) {
      const vendor = this.vendorDetector.extractVendor(receipt.ocr_text, 'ocr');
      if (vendor) return vendor;
    }
    
    // Try description
    if (receipt.description) {
      const vendor = this.vendorDetector.extractVendor(receipt.description, 'description');
      if (vendor) return vendor;
    }
    
    return null;
  }
}
```

### Interface Specifications
- **Input Interfaces**: Requires receipt data from database
- **Output Interfaces**: Provides filename generation for file operations
  ```typescript
  export interface ReceiptData {
    id: string;
    vendor?: string;
    description?: string;
    ocrText?: string;
    date: Date;
    fileType: string;
    amount?: number;
    category?: string;
  }
  
  export interface GeneratedName {
    fullName: string;
    baseName: string;
    extension: string;
    source: 'vendor' | 'description' | 'ocr' | 'fallback';
  }
  ```

## Metadata
- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-04
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria
- [ ] Generates consistent filenames with date prefixes
- [ ] Extracts vendor names from OCR, email, and description
- [ ] Sanitizes filenames for cross-platform compatibility
- [ ] Truncates long names while preserving meaning
- [ ] Supports configurable naming patterns
- [ ] Handles Japanese and English vendor names

### Verification Commands
```bash
# Test filename generation
npm run test:naming -- --grep "filename generation"
# Test vendor extraction
npm run test:vendor-detection
# Test sanitization rules
npm run test:filename-sanitization
```

## Dependencies
- **Required**: PBI-1-1-2-A - Receipt database schema
- **Required**: PBI-1-2-3 - OCR text data

## Testing Requirements
- Unit tests: Test naming logic with various receipt types
- Integration tests: Test with real OCR data
- Test data: Sample receipts with various vendor types

## Estimate
1 story point

## Priority
High - Consistent naming required for file organization

## Implementation Notes
- Support both Japanese and English business name patterns
- Consider implementing machine learning for vendor extraction
- Add configuration for industry-specific naming patterns
- Test with various file types and lengths
- Ensure filename uniqueness is handled by calling code
