# PBI-5-2-3: キーワード-カテゴリルール生成

## 説明

ユーザー修正パターンに基づいて、キーワードからカテゴリへの分類ルールの自動生成を実装します。これにより、レシートテキストのキーワードと説明に基づいて取引をカテゴリに分類するルールを作成します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/keyword-rule-generator.ts` - キーワード-カテゴリルール生成
2. `src/lib/rules/keyword-extractor.ts` - レシートテキストからのキーワード抽出
3. `src/lib/rules/text-analyzer.ts` - テキスト分析とNLPユーティリティ
4. `src/types/rules.ts` - キーワードルールタイプで更新
5. `src/lib/rules/__tests__/keyword-rule-generator.test.ts` - 単体テスト

### 技術要件

- レシートテキストと説明からキーワードを抽出
- キーワードパターンに基づく分類ルールを生成
- 重みスコア付きの複数キーワードルールをサポート
- ストップワードフィルタリングとキーワード正規化を実装
- ルール有効性と信頼度スコアを計算

### ルール生成アーキテクチャ

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

### テキスト分析

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

## 受け入れ基準

- [ ] レシートテキストから意味のあるキーワードを抽出
- [ ] キーワード-カテゴリ分類ルールを生成
- [ ] 重み付きキーワード組み合わせをサポート
- [ ] ストップワードと無関係用語をフィルタリング
- [ ] ルール有効性と信頼度を計算
- [ ] 多言語キーワード抽出（日本語・英語）を処理

## 依存関係

- **必須**: PBI-5-2-1 (パターン抽出アルゴリズム)

## テスト要件

- 単体テスト: キーワード抽出とルール生成
- 統合テスト: 日本語・英語テキストでのルール生成
- テストデータ: 様々なレシートテキストとカテゴリ修正

## 見積もり

1ストーリーポイント

## 優先度

高 - テキストベース分類に重要

## 実装ノート

- キーワード重要度スコアリングにTF-IDFを使用
- 日本語テキスト分割（MeCabまたは類似）を実装
- フレーズ検出にN-gram分析を検討
