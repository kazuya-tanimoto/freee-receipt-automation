# PBI-5-3-2: ルール優先順位・順序システム

## 説明

信頼度スコア、パフォーマンス履歴、特異性、コンテキスト関連性に基づいてルール実行を順序付ける動的ルール優先順位システムを実装します。これにより、最大マッチング精度のための最適なルール適用順序を保証します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/rule-prioritizer.ts` - ルール優先順位ロジック
2. `src/lib/rules/priority-calculator.ts` - 優先度スコア計算
3. `src/lib/rules/context-analyzer.ts` - コンテキスト関連性分析
4. `src/types/prioritization.ts` - 優先順位型定義
5. `src/lib/rules/__tests__/rule-prioritizer.test.ts` - 単体テスト

### 技術要件

- 複数要因に基づく動的ルール順序付け
- コンテキスト認識優先順位（レシートタイプ、金額、ベンダー）
- パフォーマンスベース優先度調整
- ルール特異性スコアリングと順序付け
- 手動優先度オーバーライドをサポート

### 優先順位アーキテクチャ

```typescript
interface RulePrioritizer {
  prioritizeRules(rules: MatchingRule[], context: PrioritizationContext): PrioritizedRule[];
  calculatePriority(rule: MatchingRule, context: PrioritizationContext): PriorityScore;
  updatePrioritiesFromPerformance(rulePerformance: RulePerformance[]): Promise<void>;
  getOptimalExecutionOrder(rules: MatchingRule[], context: PrioritizationContext): string[];
}

interface PrioritizedRule extends MatchingRule {
  priority: PriorityScore;
  executionOrder: number;
  reasoning: string[];
}

interface PriorityScore {
  overall: number; // 0-100
  factors: PriorityFactor[];
  confidence: number;
  specificity: number;
  performance: number;
  contextRelevance: number;
}
```

### コンテキスト分析

```typescript
interface ContextAnalyzer {
  analyzeReceiptContext(receipt: Receipt): ReceiptContext;
  calculateRuleRelevance(rule: MatchingRule, context: ReceiptContext): RelevanceScore;
  identifyContextPatterns(receipts: Receipt[]): ContextPattern[];
}

interface ReceiptContext {
  vendor?: string;
  amount: number;
  category?: string;
  date: Date;
  complexity: number;
  keywords: string[];
}
```

## 受け入れ基準

- [ ] 信頼度、パフォーマンス、特異性に基づく動的ルール順序付け
- [ ] レシートコンテキストに基づくコンテキスト認識優先順位
- [ ] 履歴パフォーマンスからの継続的優先度調整
- [ ] ルール特異性計算（より具体的なルールが優先）
- [ ] 手動優先度オーバーライドと理由トラッキング
- [ ] 最適実行順序の効率的な計算

## 依存関係

- **必須**: PBI-5-2-5 (ルール信頼度スコアリング)
- **必須**: PBI-5-3-1 (ルール実行エンジン)

## テスト要件

- 単体テスト: 優先度計算とコンテキスト分析
- 統合テスト: 様々なシナリオでの優先順位システム
- パフォーマンステスト: 大量ルールでの順序付け効率

## 見積もり

2ストーリーポイント

## 優先度

高 - ルール実行効果の最適化に重要

## 実装ノート

- 機械学習ベースのコンテキスト関連性予測
- A/Bテストによる優先順位戦略の検証
- キャッシュによる優先度計算の最適化
- 実行時間とのトレードオフバランス
