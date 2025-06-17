# PBI-5-2-5: ルール信頼度スコアリングシステム

## 説明

統計分析、サンプルサイズ、一貫性、パフォーマンス指標に基づいて、生成されたマッチングルールの包括的な信頼度スコアリングシステムを実装します。これにより、信頼できるルール適用と優先順位付けを保証します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/confidence-calculator.ts` - ルール信頼度計算エンジン
2. `src/lib/rules/statistical-analyzer.ts` - 統計分析ユーティリティ
3. `src/lib/rules/performance-tracker.ts` - ルールパフォーマンス追跡
4. `src/types/confidence.ts` - 信頼度スコア型定義
5. `src/lib/rules/__tests__/confidence-calculator.test.ts` - 単体テスト

### 技術要件

- 複数要因を使用した信頼度スコア計算
- 統計的有意性検定をサポート
- 時間経過におけるルールパフォーマンス追跡
- 古くなったルールの信頼度減衰を実装
- 信頼度説明と理由付けを提供

### 信頼度スコアリングアーキテクチャ

```typescript
interface ConfidenceCalculator {
  calculateConfidence(
    rule: MatchingRule,
    context: ConfidenceContext,
  ): ConfidenceScore;
  updateConfidence(ruleId: string, performance: RulePerformance): Promise<void>;
  getConfidenceFactors(rule: MatchingRule): ConfidenceFactor[];
  validateStatisticalSignificance(rule: MatchingRule): SignificanceTest;
}

interface ConfidenceScore {
  overall: number; // 0-1
  factors: ConfidenceFactor[];
  explanation: string;
  reliability: "high" | "medium" | "low";
  lastUpdated: Date;
}

interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}
```

### 統計分析

```typescript
interface StatisticalAnalyzer {
  performTTest(sample1: number[], sample2: number[]): TTestResult;
  calculateConfidenceInterval(
    data: number[],
    confidence: number,
  ): [number, number];
  assessSampleSize(data: number[], requiredPower: number): SampleSizeAssessment;
  detectOutliers(data: number[]): OutlierAnalysis;
}

interface SignificanceTest {
  isSignificant: boolean;
  pValue: number;
  confidenceLevel: number;
  sampleSize: number;
  effectSize: number;
}
```

## 受け入れ基準

- [ ] サンプルサイズ、一貫性、パフォーマンスに基づく信頼度計算
- [ ] 統計的有意性検定とp値計算
- [ ] 時間経過によるルールパフォーマンス追跡
- [ ] 信頼度要因の詳細説明
- [ ] 古いルールの自動信頼度減衰
- [ ] 統計的に有意でないルールの検出とフラグ付け

## 依存関係

- **必須**: PBI-5-2-1 (パターン抽出アルゴリズム)
- **必須**: PBI-5-1-4 (修正分析機能)

## テスト要件

- 単体テスト: 信頼度計算と統計分析
- 統合テスト: 様々なルールタイプでの信頼度スコア
- テストデータ: 統計的有意性とエッジケースシナリオ

## 見積もり

2ストーリーポイント

## 優先度

高 - ルール品質保証に重要

## 実装ノート

- ベイズ統計を用いた信頼度更新
- 時系列分析によるパフォーマンド傾向追跡
- 複数比較補正（Bonferroni、FDR）
- 最小サンプルサイズ要件の強制
