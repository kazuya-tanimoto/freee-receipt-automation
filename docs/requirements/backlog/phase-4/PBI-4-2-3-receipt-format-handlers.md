# PBI-4-2-3: Specialized Receipt Format Handlers

## Description

Implement specialized handlers for major receipt formats (Amazon, Apple, Rakuten, gas stations, subscriptions)
with format-specific extraction patterns, validation rules, and accuracy optimization techniques.

## Implementation Details

### Files to Create/Modify

1. `src/services/ocr/handlers/` - Format-specific handler implementations
2. `src/services/ocr/handlers/BaseReceiptHandler.ts` - Base handler class
3. `src/services/ocr/detection/FormatDetector.ts` - Receipt format detection
4. `src/lib/ocr/patterns/` - Extraction pattern definitions
5. `src/config/receipt-formats.ts` - Format configuration
6. `src/services/ocr/validation/FormatValidator.ts` - Format-specific validation
7. `src/hooks/useReceiptFormatHandling.ts` - React hook for format handling

### Technical Requirements

- Pattern-based text extraction for each format
- Machine learning-based format detection
- Confidence scoring for format matches
- Fallback handling for unrecognized formats
- Real-time format switching during processing
- Extensible architecture for new formats

### Format Handler Architecture

```typescript
interface ReceiptFormat {
  id: string;
  name: string;
  vendor: string;
  patterns: ExtractionPattern[];
  validation: ValidationRule[];
  confidence: number;
}

interface ExtractionPattern {
  field: "amount" | "date" | "vendor" | "items" | "tax";
  regex: RegExp;
  position: "header" | "body" | "footer" | "any";
  confidence: number;
  transform?: (value: string) => any;
}

abstract class BaseReceiptHandler {
  abstract detect(text: string): Promise<number>; // confidence 0-1
  abstract extract(text: string): Promise<ExtractedData>;
  abstract validate(data: ExtractedData): Promise<ValidationResult>;
  abstract optimize(image: ImageData): Promise<ProcessingHints>;
}
```

### Specialized Handlers

```typescript
class AmazonReceiptHandler extends BaseReceiptHandler {
  // Amazon-specific patterns and extraction logic
  patterns = {
    orderNumber: /Order #\s*([A-Z0-9-]+)/i,
    total: /Order Total:\s*\$?([\d,]+\.?\d*)/i,
    date: /Order Placed:\s*(\w+\s+\d{1,2},\s*\d{4})/i,
    items: /^(.+?)\s+\$?([\d,]+\.?\d*)$/gm,
  };
}

class AppleReceiptHandler extends BaseReceiptHandler {
  // Apple receipt patterns (App Store, iTunes, etc.)
  patterns = {
    total: /Total\s*\$?([\d,]+\.?\d*)/i,
    date: /(\w+\s+\d{1,2},\s*\d{4})/i,
    items: /^(.+?)\s+\$?([\d,]+\.?\d*)$/gm,
  };
}
```

### Performance Optimizations

- Parallel format detection for faster processing
- Caching of detection results
- Smart format prioritization based on user history
- Lazy loading of format handlers
- Memory-efficient pattern matching

## Estimate

2 story points

## Priority

High - Significantly improves accuracy for common receipt types
