# PBI-5-2-1: Pattern Extraction Algorithms

## Description

Implement algorithms to analyze user correction history and extract patterns for
automatic rule generation. This includes frequency analysis, correlation detection,
and pattern scoring mechanisms.

## Implementation Details

### Files to Create/Modify

1. `src/lib/rules/pattern-extractor.ts` - Core pattern extraction algorithms
2. `src/lib/rules/frequency-analyzer.ts` - Frequency-based pattern analysis
3. `src/lib/rules/correlation-detector.ts` - Cross-field correlation detection
4. `src/types/patterns.ts` - Pattern and analysis type definitions
5. `src/lib/rules/__tests__/pattern-extractor.test.ts` - Unit tests

### Technical Requirements

- Analyze correction frequency by vendor, category, and keywords
- Detect correlations between receipt fields and corrections
- Calculate pattern confidence scores based on sample size
- Support minimum threshold filtering (5+ occurrences)
- Implement pattern scoring algorithm

### Algorithm Architecture

```typescript
interface PatternExtractor {
  extractVendorPatterns(corrections: UserCorrection[]): VendorPattern[];
  extractKeywordPatterns(corrections: UserCorrection[]): KeywordPattern[];
  extractAmountPatterns(corrections: UserCorrection[]): AmountPattern[];
  extractDatePatterns(corrections: UserCorrection[]): DatePattern[];
}

interface Pattern {
  type: PatternType;
  pattern: string;
  frequency: number;
  confidence: number;
  samples: number;
  lastSeen: Date;
}

interface VendorPattern extends Pattern {
  vendor: string;
  targetCategory: string;
  variations: string[];
}
```

### Pattern Types

```typescript
type PatternType = 'vendor_category' | 'keyword_category' | 'amount_tolerance' | 'date_adjustment';

interface PatternAnalysis {
  totalCorrections: number;
  uniquePatterns: number;
  highConfidencePatterns: Pattern[];
  lowConfidencePatterns: Pattern[];
  correlations: FieldCorrelation[];
}
```

## Acceptance Criteria

- [ ] Extract vendor-to-category mapping patterns
- [ ] Identify keyword-based classification patterns
- [ ] Calculate confidence scores for patterns
- [ ] Filter patterns by minimum frequency threshold
- [ ] Detect cross-field correlations in corrections
- [ ] Generate pattern analysis reports

## Dependencies

- **Required**: PBI-5-1-2 (Correction Data Collection API)

## Testing Requirements

- Unit tests: Pattern extraction algorithms
- Integration tests: Analysis with sample correction data
- Test data: Various correction patterns and edge cases

## Estimate

2 story points

## Priority

High - Core algorithm for rule generation

## Implementation Notes

- Use statistical analysis for pattern confidence
- Implement caching for expensive pattern analysis
- Consider time-decay for pattern relevance
