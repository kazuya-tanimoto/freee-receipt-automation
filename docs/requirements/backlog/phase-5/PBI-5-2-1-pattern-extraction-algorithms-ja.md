# PBI-5-2-1: パターン抽出アルゴリズム

## 説明

ユーザー修正履歴を分析し、自動ルール生成のためのパターンを抽出するアルゴリズムを実装します。頻度分析、相関検出、パターンスコア機構を含みます。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/pattern-extractor.ts` - コアパターン抽出アルゴリズム
2. `src/lib/rules/frequency-analyzer.ts` - 頻度ベースパターン分析
3. `src/lib/rules/correlation-detector.ts` - フィールド間相関検出
4. `src/types/patterns.ts` - パターンと分析の型定義
5. `src/lib/rules/__tests__/pattern-extractor.test.ts` - 単体テスト

### 技術要件

- ベンダー、カテゴリ、キーワード別の修正頻度を分析
- レシートフィールドと修正間の相関を検出
- サンプルサイズに基づくパターン信頼度スコアを計算
- 最小閾値フィルタリング（5回以上の発生）をサポート
- パターンスコアアルゴリズムを実装

### アルゴリズムアーキテクチャ

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

### パターンタイプ

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

## 受け入れ基準

- [ ] ベンダー-カテゴリマッピングパターンを抽出
- [ ] キーワードベース分類パターンを特定
- [ ] パターンの信頼度スコアを計算
- [ ] 最小頻度閾値でパターンをフィルタリング
- [ ] 修正におけるフィールド間相関を検出
- [ ] パターン分析レポートを生成

## 依存関係

- **必須**: PBI-5-1-2 (修正データ収集API)

## テスト要件

- 単体テスト: パターン抽出アルゴリズム
- 統合テスト: サンプル修正データでの分析
- テストデータ: 様々な修正パターンとエッジケース

## 見積もり

2ストーリーポイント

## 優先度

高 - ルール生成のコアアルゴリズム

## 実装ノート

- パターン信頼度に統計分析を使用
- 高コストパターン分析のキャッシュを実装
- パターン関連性に時間減衰を考慮
- 最小サンプルサイズチェックで不十分なデータを適切に処理

### リスク軽減

```typescript
// 不十分なデータシナリオを処理
if (corrections.length < MIN_SAMPLE_SIZE) {
  return {
    patterns: [],
    confidence: 0,
    reason: 'insufficient_data',
    requiredSamples: MIN_SAMPLE_SIZE,
  };
}

// 低品質データの優雅な劣化
if (dataQualityScore < QUALITY_THRESHOLD) {
  return {
    patterns: fallbackPatterns,
    confidence: 0.3,
    reason: 'low_quality_data',
  };
}
```
