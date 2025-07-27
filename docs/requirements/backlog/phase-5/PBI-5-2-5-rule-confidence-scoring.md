# PBI-5-2-5: Rule Confidence Scoring System

## Description

Implement comprehensive confidence scoring system for generated matching rules based on statistical analysis, sample
size, consistency, and performance metrics. This ensures reliable rule application and prioritization.

## Implementation Details

### Files to Create/Modify

1. `src/lib/rules/confidence-calculator.ts` - Rule confidence calculation engine
2. `src/lib/rules/statistical-analyzer.ts` - Statistical analysis utilities
3. `src/lib/rules/performance-tracker.ts` - Rule performance tracking
4. `src/types/confidence.ts` - Confidence scoring type definitions
5. `src/lib/rules/__tests__/confidence-calculator.test.ts` - Unit tests

### Technical Requirements

- Calculate confidence scores using multiple factors
- Support statistical significance testing
- Track rule performance over time
- Implement confidence decay for aging rules
- Provide confidence explanations and reasoning

### Confidence Scoring Architecture

```typescript
interface ConfidenceCalculator {
  calculateConfidence(rule: MatchingRule, context: ConfidenceContext): ConfidenceScore;
  updateConfidence(ruleId: string, performance: RulePerformance): Promise<void>;
  getConfidenceFactors(rule: MatchingRule): ConfidenceFactor[];
  validateStatisticalSignificance(rule: MatchingRule): SignificanceTest;
}

interface ConfidenceScore {
  overall: number; // 0-1
  factors: ConfidenceFactor[];
  explanation: string;
  reliability: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}
```

### Scoring Factors

```typescript
interface ConfidenceContext {
  sampleSize: number;
  consistencyRatio: number;
  timeSpan: number;
  performanceHistory: RulePerformance[];
  statisticalSignificance: number;
}

interface RulePerformance {
  ruleId: string;
  successRate: number;
  totalApplications: number;
  averageConfidence: number;
  period: TimePeriod;
}

interface SignificanceTest {
  isSignificant: boolean;
  pValue: number;
  confidenceInterval: [number, number];
  sampleSize: number;
  testType: string;
}
```

## Acceptance Criteria

- [ ] Calculate multi-factor confidence scores for rules
- [ ] Perform statistical significance testing
- [ ] Track rule performance and update confidence
- [ ] Implement confidence decay over time
- [ ] Provide clear confidence explanations
- [ ] Support confidence-based rule filtering

## Dependencies

- **Required**: PBI-5-2-2, PBI-5-2-3, PBI-5-2-4 (Rule Generation components)

## Testing Requirements

- Unit tests: Confidence calculation algorithms
- Integration tests: Confidence updates with rule performance
- Test data: Rules with various performance characteristics

## Estimate

1 story point

## Priority

High - Critical for reliable rule application

## Implementation Notes

- Use Chi-square test for statistical significance
- Implement Bayesian confidence updates
- Consider ensemble scoring methods
