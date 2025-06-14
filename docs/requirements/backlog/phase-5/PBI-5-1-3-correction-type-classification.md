# PBI-5-1-3: Correction Type Classification System

## Description

Implement automatic classification system for user corrections to categorize the type
of adjustment made (date, amount, vendor, category, unmatch). This includes detection
algorithms and metadata tagging for correction analysis.

## Implementation Details

### Files to Create/Modify

1. `src/lib/corrections/classifier.ts` - Correction type classification logic
2. `src/lib/corrections/change-detector.ts` - Before/after change detection
3. `src/types/corrections.ts` - Update with classification types
4. `src/lib/corrections/__tests__/classifier.test.ts` - Unit tests
5. `src/lib/corrections/metadata-tagger.ts` - Metadata extraction and tagging

### Technical Requirements

- Automatically detect correction type from before/after data
- Support multiple correction types in single adjustment
- Extract relevant metadata (field changes, magnitudes)
- Assign confidence scores to classifications
- Handle edge cases and ambiguous corrections

### Classification Architecture

```typescript
interface CorrectionClassifier {
  classify(beforeData: CorrectionData, afterData: CorrectionData): ClassificationResult;
  detectChanges(beforeData: CorrectionData, afterData: CorrectionData): FieldChange[];
  extractMetadata(correction: UserCorrection): CorrectionMetadata;
}

interface ClassificationResult {
  primaryType: CorrectionType;
  secondaryTypes: CorrectionType[];
  confidence: number;
  changes: FieldChange[];
  metadata: CorrectionMetadata;
}

interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'add' | 'remove' | 'modify';
  magnitude?: number;
}
```

### Classification Logic

```typescript
type CorrectionType = 'date' | 'amount' | 'vendor' | 'category' | 'unmatch';

interface CorrectionMetadata {
  dateShift?: number; // days
  amountDifference?: number;
  vendorSimilarity?: number;
  categoryChange?: string;
  confidence: number;
  tags: string[];
}
```

## Acceptance Criteria

- [ ] Automatically classify correction types from data changes
- [ ] Detect multiple correction types in single adjustment
- [ ] Calculate confidence scores for classifications
- [ ] Extract meaningful metadata from corrections
- [ ] Handle edge cases and ambiguous corrections
- [ ] Tag corrections with relevant attributes

## Dependencies

- **Required**: PBI-5-1-1 (Correction Data Table)

## Testing Requirements

- Unit tests: Classification algorithms and edge cases
- Integration tests: Classification with real correction data
- Test data: Various correction scenarios and combinations

## Estimate

1 story point

## Priority

Medium - Important for correction analysis

## Implementation Notes

- Use fuzzy matching for vendor name changes
- Implement threshold-based classification confidence
- Consider machine learning for complex classifications
