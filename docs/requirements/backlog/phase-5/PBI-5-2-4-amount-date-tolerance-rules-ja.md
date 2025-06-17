# PBI-5-2-4: 金額・日付許容ルール生成

## 説明

ユーザー修正パターンに基づいて、金額許容と日付調整ルールの自動生成を実装します。これにより、レシート-取引マッチング時の金額と日付の許容可能なバリエーションを処理するルールを作成します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/tolerance-rule-generator.ts` - 金額・日付許容ルール生成
2. `src/lib/rules/amount-analyzer.ts` - 金額バリエーション分析
3. `src/lib/rules/date-analyzer.ts` - 日付調整パターン分析
4. `src/types/rules.ts` - 許容ルールタイプで更新
5. `src/lib/rules/__tests__/tolerance-rule-generator.test.ts` - 単体テスト

### 技術要件

- ユーザー修正における金額バリエーションを分析
- 日付調整パターン（±N日）を検出
- 信頼区間付きの許容ルールを生成
- コンテキスト固有許容（ベンダーベース）をサポート
- データから最適な許容閾値を計算

### ルール生成アーキテクチャ

```typescript
interface ToleranceRuleGenerator {
  generateAmountRules(
    corrections: UserCorrection[],
  ): Promise<AmountToleranceRule[]>;
  generateDateRules(
    corrections: UserCorrection[],
  ): Promise<DateToleranceRule[]>;
  analyzeAmountVariations(
    corrections: UserCorrection[],
  ): AmountVariationAnalysis;
  analyzeDateAdjustments(corrections: UserCorrection[]): DateAdjustmentAnalysis;
}

interface AmountToleranceRule extends MatchingRule {
  ruleType: "amount_tolerance";
  ruleData: {
    toleranceType: "percentage" | "fixed" | "adaptive";
    toleranceValue: number;
    minAmount?: number;
    maxAmount?: number;
    vendorSpecific?: string;
  };
}

interface DateToleranceRule extends MatchingRule {
  ruleType: "date_tolerance";
  ruleData: {
    toleranceType: "days" | "business_days" | "adaptive";
    toleranceDays: number;
    direction: "before" | "after" | "both";
    contextSpecific?: string[];
  };
}
```

### 分析アルゴリズム

```typescript
interface AmountVariationAnalysis {
  averageVariation: number;
  medianVariation: number;
  standardDeviation: number;
  confidenceInterval: [number, number];
  vendorSpecificVariations: VendorVariation[];
}

interface DateAdjustmentAnalysis {
  commonAdjustments: DateAdjustment[];
  averageAdjustment: number;
  adjustmentPatterns: AdjustmentPattern[];
  seasonalVariations: SeasonalPattern[];
}
```

## 受け入れ基準

- [ ] ユーザー修正から金額バリエーションパターンを分析
- [ ] 日付調整パターン（±N日）を検出
- [ ] 統計的分析に基づく信頼区間付き許容ルールを生成
- [ ] ベンダー固有とコンテキスト固有の許容をサポート
- [ ] データから最適な許容閾値を自動計算
- [ ] 許容ルールの有効性と精度を追跡

## 依存関係

- **必須**: PBI-5-2-1 (パターン抽出アルゴリズム)

## テスト要件

- 単体テスト: 許容ルール生成と分析アルゴリズム
- 統合テスト: 様々な修正パターンでのルール生成
- テストデータ: 金額・日付バリエーションとエッジケース

## 見積もり

1ストーリーポイント

## 優先度

高 - マッチング精度向上に重要

## 実装ノート

- 統計的手法を用いた信頼区間計算
- 外れ値検出と除外ロジック
- コンテキスト認識型許容調整
- ベンダー別許容パターンの学習
