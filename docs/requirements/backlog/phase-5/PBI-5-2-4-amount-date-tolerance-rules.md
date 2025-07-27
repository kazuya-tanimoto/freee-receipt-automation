# PBI-5-2-4: Amount and Date Tolerance Rule Generation

## Description

Implement automatic generation of amount tolerance and date adjustment rules based on user correction patterns. This
creates rules for handling acceptable variations in amounts and dates during receipt-transaction matching.

## Implementation Details

### Files to Create/Modify

1. `src/lib/rules/tolerance-rule-generator.ts` - Amount/date tolerance rule generation
2. `src/lib/rules/amount-analyzer.ts` - Amount variation analysis
3. `src/lib/rules/date-analyzer.ts` - Date adjustment pattern analysis
4. `src/types/rules.ts` - Update with tolerance rule types
5. `src/lib/rules/__tests__/tolerance-rule-generator.test.ts` - Unit tests

### Technical Requirements

- Analyze amount variations in user corrections
- Detect date adjustment patterns (±N days)
- Generate tolerance rules with confidence intervals
- Support context-specific tolerance (vendor-based)
- Calculate optimal tolerance thresholds from data

### Rule Generation Architecture

```typescript
interface ToleranceRuleGenerator {
  generateAmountRules(corrections: UserCorrection[]): Promise<AmountToleranceRule[]>;
  generateDateRules(corrections: UserCorrection[]): Promise<DateToleranceRule[]>;
  analyzeAmountVariations(corrections: UserCorrection[]): AmountVariationAnalysis;
  analyzeDateAdjustments(corrections: UserCorrection[]): DateAdjustmentAnalysis;
}

interface AmountToleranceRule extends MatchingRule {
  ruleType: 'amount_tolerance';
  ruleData: {
    toleranceType: 'percentage' | 'fixed' | 'adaptive';
    toleranceValue: number;
    minAmount?: number;
    maxAmount?: number;
    vendorSpecific?: string;
  };
}

interface DateToleranceRule extends MatchingRule {
  ruleType: 'date_tolerance';
  ruleData: {
    toleranceDays: number;
    direction: 'before' | 'after' | 'both';
    contextRules: DateContextRule[];
  };
}
```

### Analysis Components

```typescript
interface AmountVariationAnalysis {
  averageVariation: number;
  standardDeviation: number;
  percentileRanges: PercentileRange[];
  vendorSpecificVariations: VendorVariation[];
  recommendedTolerance: ToleranceRecommendation;
}

interface DateAdjustmentAnalysis {
  commonAdjustments: DateAdjustment[];
  averageDaysShift: number;
  adjustmentDirection: 'before' | 'after' | 'both';
  seasonalPatterns: SeasonalPattern[];
  recommendedTolerance: number;
}

interface DateAdjustment {
  daysShift: number;
  frequency: number;
  context: string;
  confidence: number;
}
```

## Acceptance Criteria

- [ ] Analyze amount variations from user corrections
- [ ] Detect date adjustment patterns and preferences
- [ ] Generate tolerance rules with optimal thresholds
- [ ] Support vendor-specific and context-aware tolerances
- [ ] Calculate confidence intervals for tolerances
- [ ] Provide rule effectiveness metrics

## Dependencies

- **Required**: PBI-5-2-1 (Pattern Extraction Algorithms)

## Testing Requirements

- Unit tests: Tolerance analysis and rule generation
- Integration tests: Rule generation with correction data
- Test data: Various amount and date correction scenarios

## Estimate

1 story point

## Priority

Medium - Improves matching flexibility

## Implementation Notes

- Use statistical analysis for tolerance calculation
- Implement outlier detection for robust tolerances
- Consider time-based tolerance adjustments
