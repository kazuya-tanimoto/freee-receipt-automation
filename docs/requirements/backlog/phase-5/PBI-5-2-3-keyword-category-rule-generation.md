# PBI-5-2-3: Keyword-Category Rule Generation

## Description

Implement automatic generation of keyword-to-category classification rules based
on user correction patterns. This creates rules that classify transactions into
categories based on receipt text keywords and descriptions.

## Implementation Details

### Files to Create/Modify

1. `src/lib/rules/keyword-rule-generator.ts` - Keyword-category rule generation
2. `src/lib/rules/keyword-extractor.ts` - Keyword extraction from receipt text
3. `src/lib/rules/text-analyzer.ts` - Text analysis and NLP utilities
4. `src/types/rules.ts` - Update with keyword rule types
5. `src/lib/rules/__tests__/keyword-rule-generator.test.ts` - Unit tests

### Technical Requirements

- Extract keywords from receipt text and descriptions
- Generate classification rules based on keyword patterns
- Support multiple keywords per rule with weight scoring
- Implement stop word filtering and keyword normalization
- Calculate rule effectiveness and confidence scores

### Rule Generation Architecture

```typescript
interface KeywordRuleGenerator {
  generateRules(corrections: UserCorrection[]): Promise<KeywordRule[]>;
  extractKeywords(receiptText: string): ExtractedKeyword[];
  analyzeKeywordEffectiveness(keywords: string[], corrections: UserCorrection[]): KeywordAnalysis;
  generateKeywordCombinations(keywords: ExtractedKeyword[]): KeywordCombination[];
}

interface KeywordRule extends MatchingRule {
  ruleType: 'keyword_category';
  ruleData: {
    keywords: string[];
    keywordWeights: Record<string, number>;
    targetCategory: string;
    matchThreshold: number;
    requireAllKeywords: boolean;
  };
}

interface ExtractedKeyword {
  word: string;
  frequency: number;
  weight: number;
  context: string[];
  category: string;
}
```

### Text Analysis

```typescript
interface TextAnalyzer {
  tokenize(text: string): string[];
  removeStopWords(tokens: string[]): string[];
  stemWords(tokens: string[]): string[];
  calculateTfIdf(documents: string[]): TfIdfResult;
  extractNGrams(tokens: string[], n: number): string[];
}

interface KeywordAnalysis {
  totalKeywords: number;
  significantKeywords: ExtractedKeyword[];
  categoryCorrelations: CategoryCorrelation[];
  effectiveness: number;
}
```

## Acceptance Criteria

- [ ] Extract meaningful keywords from receipt text
- [ ] Generate keyword-category classification rules
- [ ] Support weighted keyword combinations
- [ ] Filter out stop words and irrelevant terms
- [ ] Calculate rule effectiveness and confidence
- [ ] Handle multilingual keyword extraction (Japanese/English)

## Dependencies

- **Required**: PBI-5-2-1 (Pattern Extraction Algorithms)

## Testing Requirements

- Unit tests: Keyword extraction and rule generation
- Integration tests: Rule generation with Japanese/English text
- Test data: Various receipt texts and category corrections

## Estimate

1 story point

## Priority

High - Important for text-based classification

## Implementation Notes

- Use TF-IDF for keyword significance scoring
- Implement Japanese text tokenization (MeCab or similar)
- Consider N-gram analysis for phrase detection
