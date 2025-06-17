# PBI-5-3-3: ルール競合検出・解決

## 説明

マッチングルール間の競合を検出・解決するシステムを実装し、矛盾するルール、重複する条件、競合するマッチを処理します。これにより、複雑なシナリオでの一貫性と予測可能なルール動作を保証します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/conflict-detector.ts` - ルール競合検出ロジック
2. `src/lib/rules/conflict-resolver.ts` - 競合解決戦略
3. `src/lib/rules/rule-compatibility.ts` - ルール互換性分析
4. `src/types/conflicts.ts` - 競合タイプ定義
5. `src/lib/rules/__tests__/conflict-resolution.test.ts` - 単体テスト

### 技術要件

- 様々なタイプのルール競合を検出
- 複数の競合解決戦略を実装
- ユーザー定義の競合解決設定をサポート
- 競合解決決定を追跡・ログ
- 競合分析と推奨事項を提供

### 競合検出アーキテクチャ

```typescript
interface ConflictDetector {
  detectConflicts(rules: MatchingRule[]): RuleConflict[];
  analyzeRuleCompatibility(
    rule1: MatchingRule,
    rule2: MatchingRule,
  ): CompatibilityAnalysis;
  findOverlappingRules(rules: MatchingRule[]): RuleOverlap[];
  detectContradictoryRules(rules: MatchingRule[]): ContradictoryRule[];
}

interface RuleConflict {
  id: string;
  type: ConflictType;
  conflictingRules: string[];
  severity: "low" | "medium" | "high";
  description: string;
  examples: ConflictExample[];
  resolutionSuggestions: ResolutionSuggestion[];
}

type ConflictType =
  | "contradiction"
  | "overlap"
  | "circular_dependency"
  | "mutual_exclusion";
```

### 競合解決

```typescript
interface ConflictResolver {
  resolveConflict(
    conflict: RuleConflict,
    strategy: ResolutionStrategy,
  ): ResolutionResult;
  suggestResolutions(conflict: RuleConflict): ResolutionSuggestion[];
  applyResolution(resolution: Resolution): Promise<void>;
  trackResolutionDecision(decision: ResolutionDecision): Promise<void>;
}

interface ResolutionStrategy {
  type:
    | "priority_based"
    | "confidence_based"
    | "user_preference"
    | "context_specific";
  parameters: ResolutionParameters;
}

interface ResolutionResult {
  success: boolean;
  appliedResolution: Resolution;
  affectedRules: string[];
  newConflicts: RuleConflict[];
}
```

## 受け入れ基準

- [ ] 矛盾、重複、循環依存、相互排他の検出
- [ ] 優先度、信頼度、コンテキストベースの解決戦略
- [ ] ユーザー設定可能な競合解決設定
- [ ] 包括的な競合分析と推奨事項
- [ ] 解決決定の追跡と監査ログ
- [ ] 解決後の新規競合の自動検出

## 依存関係

- **必須**: PBI-5-3-2 (ルール優先順位システム)
- **必須**: PBI-5-2-5 (ルール信頼度スコアリング)

## テスト要件

- 単体テスト: 競合検出と解決アルゴリズム
- 統合テスト: 複雑な競合シナリオでの解決
- テストデータ: 様々な競合タイプとエッジケース

## 見積もり

2ストーリーポイント

## 優先度

高 - ルールシステムの安定性に重要

## 実装ノート

- グラフ理論を用いた循環依存検出
- ルール意味論的分析による矛盾検出
- 机上組み合わせ最適化による最適解決
- ユーザーフィードバックループによる継続改善
