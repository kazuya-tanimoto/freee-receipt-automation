# PBI-4-3-3: マッチング競合解決システム

## 説明

取引に対する複数レシート候補、レシートに対する複数取引候補、曖昧なマッチを処理するインテリジェント競合解決システムを実装し、
優先順位ルールと自動解決機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/services/matching/ConflictResolver.ts` - メイン競合解決サービス
2. `src/services/matching/resolution/` - 競合解決戦略実装
3. `src/lib/matching/conflict-detection.ts` - 競合検出ロジック
4. `src/lib/matching/resolution-rules.ts` - 解決ルール定義
5. `src/components/matching/ConflictResolutionUI.tsx` - 競合解決UIコンポーネント
6. `src/hooks/useConflictResolution.ts` - 競合解決用Reactフック
7. `src/api/matching/conflicts.ts` - 競合解決API エンドポイント
8. `src/services/matching/learning/ResolutionLearning.ts` - 解決学習システム

### 技術要件

- 単一取引に対する複数レシート候補の処理
- 単一レシートに対する複数取引候補の処理
- 曖昧なマッチの優先順位ルール
- 信頼度ベース競合解決
- 学習のためのユーザーフィードバック統合
- 手動オーバーライド付き自動競合解決
- 競合解決履歴とパターン分析

### 競合解決アーキテクチャ

```typescript
interface MatchingConflict {
  type: "multiple_receipts" | "multiple_transactions" | "ambiguous_match";
  confidence: number;
  candidates: MatchCandidate[];
  resolution: ConflictResolution;
  context: ConflictContext;
  priority: "low" | "medium" | "high" | "critical";
}

interface ConflictResolver {
  detectConflicts(matches: MatchingResult[]): Promise<MatchingConflict[]>;
  resolveConflict(conflict: MatchingConflict): Promise<ConflictResolution>;
  applyResolution(resolution: ConflictResolution): Promise<boolean>;
  learnFromResolution(
    conflict: MatchingConflict,
    userChoice: ResolutionChoice,
  ): Promise<void>;
  getConflictHistory(dateRange: DateRange): Promise<ConflictHistory[]>;
}

interface MatchCandidate {
  entity: Receipt | Transaction;
  confidence: number;
  matchingCriteria: MatchingCriteria[];
  conflictReasons: string[];
  resolutionSuggestions: string[];
}

interface ConflictResolution {
  strategy: "auto" | "manual" | "defer";
  selectedCandidate?: MatchCandidate;
  reasoning: string;
  confidence: number;
  requiresReview: boolean;
  fallbackActions: string[];
}
```

### 競合検出エンジン

```typescript
class ConflictDetector {
  // 複数レシート競合検出
  detectMultipleReceiptConflicts(
    transaction: Transaction,
    receipts: Receipt[],
  ): MatchingConflict[] {
    const matchingReceipts = receipts.filter((r) =>
      this.couldMatch(transaction, r),
    );
    if (matchingReceipts.length > 1) {
      return [
        {
          type: "multiple_receipts",
          candidates: matchingReceipts.map((r) =>
            this.createCandidate(r, transaction),
          ),
          confidence: this.calculateConflictConfidence(matchingReceipts),
          priority: this.determineConflictPriority(matchingReceipts),
        },
      ];
    }
    return [];
  }

  // 複数取引競合検出
  detectMultipleTransactionConflicts(
    receipt: Receipt,
    transactions: Transaction[],
  ): MatchingConflict[] {
    const matchingTransactions = transactions.filter((t) =>
      this.couldMatch(receipt, t),
    );
    if (matchingTransactions.length > 1) {
      return [
        {
          type: "multiple_transactions",
          candidates: matchingTransactions.map((t) =>
            this.createCandidate(t, receipt),
          ),
          confidence: this.calculateConflictConfidence(matchingTransactions),
          priority: this.determineConflictPriority(matchingTransactions),
        },
      ];
    }
    return [];
  }

  // 曖昧マッチ検出
  detectAmbiguousMatches(matches: MatchingResult[]): MatchingConflict[] {
    return matches
      .filter((match) => match.confidence < 0.8 && match.confidence > 0.3)
      .map((match) => ({
        type: "ambiguous_match",
        candidates: [this.createCandidate(match.transaction, match.receipt)],
        confidence: match.confidence,
        priority: "medium",
      }));
  }
}
```

### 解決戦略実装

```typescript
class AutoResolutionStrategy {
  // 信頼度ベース自動解決
  async resolveByConfidence(
    conflict: MatchingConflict,
  ): Promise<ConflictResolution> {
    const bestCandidate = conflict.candidates.sort(
      (a, b) => b.confidence - a.confidence,
    )[0];

    if (bestCandidate.confidence > 0.9) {
      return {
        strategy: "auto",
        selectedCandidate: bestCandidate,
        reasoning: `高信頼度マッチ (${(bestCandidate.confidence * 100).toFixed(1)}%)`,
        confidence: bestCandidate.confidence,
        requiresReview: false,
      };
    }

    return this.deferToManualReview(conflict);
  }

  // 履歴パターンベース解決
  async resolveByHistoricalPattern(
    conflict: MatchingConflict,
  ): Promise<ConflictResolution> {
    const historicalResolutions = await this.getHistoricalResolutions(conflict);
    const patternMatch = this.findPatternMatch(conflict, historicalResolutions);

    if (patternMatch && patternMatch.confidence > 0.8) {
      return {
        strategy: "auto",
        selectedCandidate: patternMatch.candidate,
        reasoning: `履歴パターンマッチング (類似ケース: ${patternMatch.similarCases}件)`,
        confidence: patternMatch.confidence,
        requiresReview: false,
      };
    }

    return this.deferToManualReview(conflict);
  }
}

class ManualResolutionStrategy {
  // ユーザー介入付き解決
  async resolveWithUserInput(
    conflict: MatchingConflict,
  ): Promise<ConflictResolution> {
    // UIコンポーネントを通じてユーザー選択を待機
    const userChoice = await this.promptUserForResolution(conflict);

    return {
      strategy: "manual",
      selectedCandidate: userChoice.candidate,
      reasoning: `ユーザー選択: ${userChoice.reason}`,
      confidence: userChoice.confidence,
      requiresReview: false,
    };
  }
}
```

### 学習システム

```typescript
class ResolutionLearningSystem {
  // ユーザー解決からの学習
  async learnFromUserResolution(
    conflict: MatchingConflict,
    userResolution: ConflictResolution,
  ): Promise<void> {
    const learningData = {
      conflictFeatures: this.extractConflictFeatures(conflict),
      resolutionChoice: userResolution.selectedCandidate,
      userReasoning: userResolution.reasoning,
      timestamp: new Date(),
    };

    await this.updateResolutionModel(learningData);
    await this.updateResolutionRules(learningData);
  }

  // 解決パターンの改善
  async improveResolutionPatterns(): Promise<void> {
    const recentResolutions = await this.getRecentResolutions();
    const patterns = this.analyzeResolutionPatterns(recentResolutions);
    await this.updateAutomaticResolutionRules(patterns);
  }
}
```

### セキュリティ考慮事項

- 競合データの安全な処理
- ユーザー解決選択の権限検証
- 自動解決の監査ログ
- 機密取引情報の保護

### パフォーマンス最適化

- 効率的競合検出アルゴリズム
- 解決戦略の並列実行
- 競合解決結果のキャッシュ
- 大容量データセット用バッチ処理
- リアルタイム競合解決

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] 複数レシート候補が適切に検出・解決される
- [ ] 複数取引候補が効率的に処理される
- [ ] 曖昧なマッチに優先順位ルールが適用される
- [ ] 自動解決が高信頼度ケースで機能する
- [ ] ユーザー介入が複雑なケースで利用可能
- [ ] 学習システムが解決精度を向上させる
- [ ] 競合解決履歴が追跡される

## 依存関係

- **必須**: PBI-4-3-1 - 高度マッチング技術
- **必須**: PBI-4-3-2 - マルチステージマッチングパイプライン

## テスト要件

- Unit Tests (Vitest): 競合検出、解決戦略、学習アルゴリズム
- Integration Tests (Testing Library): 完全な競合解決ワークフロー
- UI Tests: 競合解決インターフェース
- Performance Tests: 大容量競合データでの解決速度

### テストカバレッジ要件

- 競合検出: 100%
- 解決戦略: 95%
- 学習システム: 90%
- ユーザーインターフェース: 85%

## 見積もり

2 ストーリーポイント

## 優先度

高 - 複雑なマッチングシナリオの処理に重要

## 実装ノート

- 複雑な競合ケース用の包括的テストシナリオ作成
- ユーザー体験を重視した直感的競合解決UI設計
- 解決品質向上のための継続的学習メカニズム
- 解決決定のデバッグ用詳細ログ記録
- 競合解決パフォーマンス監視とアラート
