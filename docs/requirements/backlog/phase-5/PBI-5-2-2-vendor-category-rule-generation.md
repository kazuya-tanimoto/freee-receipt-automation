# PBI-5-2-2: Vendor-Category Rule Generation

## Description

Implement automatic generation of vendor-to-category mapping rules based on user
correction patterns. This creates rules that map specific vendors to expense
categories based on historical user corrections.

## Implementation Details

### Files to Create/Modify

1. `src/lib/rules/vendor-rule-generator.ts` - Vendor-category rule generation logic
2. `src/lib/rules/vendor-matcher.ts` - Vendor name matching and normalization
3. `src/types/rules.ts` - Update with vendor rule types
4. `src/lib/rules/__tests__/vendor-rule-generator.test.ts` - Unit tests
5. `src/lib/rules/rule-templates.ts` - Rule template definitions

### Technical Requirements

- Generate rules from vendor-category correction patterns
- Handle vendor name variations and fuzzy matching
- Calculate rule confidence based on correction frequency
- Support rule refinement from new corrections
- Implement rule conflict detection and resolution

### Rule Generation Architecture

```typescript
interface VendorRuleGenerator {
  generateRules(corrections: UserCorrection[]): Promise<VendorRule[]>;
  refineExistingRules(
    rules: VendorRule[],
    newCorrections: UserCorrection[],
  ): Promise<VendorRule[]>;
  detectConflicts(rules: VendorRule[]): RuleConflict[];
  normalizeVendorName(vendorName: string): string;
}

interface VendorRule extends MatchingRule {
  ruleType: "vendor_category";
  ruleData: {
    vendorPattern: string;
    vendorVariations: string[];
    targetCategory: string;
    fuzzyMatchThreshold: number;
  };
}

interface VendorRuleData {
  vendorPattern: string;
  vendorVariations: string[];
  targetCategory: string;
  fuzzyMatchThreshold: number;
  caseSensitive: boolean;
}
```

### Vendor Matching

```typescript
interface VendorMatcher {
  matchVendor(receiptVendor: string, rulePattern: string): MatchResult;
  calculateSimilarity(vendor1: string, vendor2: string): number;
  normalizeVendorName(vendorName: string): string;
  extractVendorVariations(corrections: UserCorrection[]): VendorVariation[];
}

interface VendorVariation {
  canonicalName: string;
  variations: string[];
  frequency: number;
}
```

## Acceptance Criteria

- [ ] Generate vendor-category rules from correction patterns
- [ ] Handle vendor name variations and fuzzy matching
- [ ] Calculate confidence scores based on correction frequency
- [ ] Support rule refinement from new correction data
- [ ] Detect and resolve rule conflicts
- [ ] Normalize vendor names for consistent matching

## Dependencies

- **Required**: PBI-5-2-1 (Pattern Extraction Algorithms)

## Testing Requirements

- Unit tests: Rule generation logic and vendor matching
- Integration tests: Rule generation with real correction data
- Test data: Various vendor names and correction patterns

## Estimate

1 story point

## Priority

High - Core rule type for matching automation

## Implementation Notes

- Use Levenshtein distance for fuzzy vendor matching
- Implement vendor name normalization (case, punctuation)
- Consider machine learning for advanced vendor matching
