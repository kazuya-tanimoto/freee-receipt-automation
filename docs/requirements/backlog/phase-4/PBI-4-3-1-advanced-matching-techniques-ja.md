# PBI-4-3-1: 高度マッチング技術

## 説明

日付範囲マッチング、金額許容マッチング、ベンダー名部分文字列マッチング、設定可能なスコアリングを含むルールベースマッチングアルゴリズムを実装し、レシート-取引の精度を向上させます。

## 実装詳細

### 技術要件

- 日付範囲マッチング（±3日許容）
- 金額許容マッチング（±5%許容）
- ベンダー名部分文字列マッチング
- シンプルな重み付けスコアリングシステム:
  - 日付マッチ: 30%重み
  - 金額マッチ: 40%重み
  - ベンダーマッチ: 30%重み
- 設定可能なマッチング闾値
- ルールベース信頼度スコアリング

### 高度マッチングアーキテクチャ

```typescript
interface MatchingAlgorithm {
  dateRangeMatch(
    receiptDate: Date,
    transactionDate: Date,
    toleranceDays: number,
  ): number;
  amountToleranceMatch(
    receiptAmount: number,
    transactionAmount: number,
    tolerancePercent: number,
  ): number;
  vendorSubstringMatch(
    receiptVendor: string,
    transactionVendor: string,
  ): number;
  calculateWeightedScore(scores: MatchingScores): number;
}
```

## 見積もり

1 ストーリーポイント

## 優先度

高 - マッチング精度の中核改善
