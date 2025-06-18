# PBI-4-3-2: マルチステージマッチングパイプライン

## 説明

一次完全マッチング、二次ファジーマッチング、エッジケース用フォールバックマッチングを含む洗練されたマルチステージマッチングパイプラインを作成し、設定可能なステージと信頼度閾値を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/services/matching/MultiStageMatchingPipeline.ts` - メインパイプラインサービス
2. `src/services/matching/stages/` - 個別マッチングステージ実装
3. `src/lib/matching/stage-config.ts` - ステージ設定管理
4. `src/lib/matching/pipeline-optimizer.ts` - パイプライン最適化器
5. `src/hooks/useMatchingPipeline.ts` - パイプライン用Reactフック
6. `src/api/matching/pipeline.ts` - パイプラインAPI エンドポイント
7. `src/workers/matching-pipeline.worker.ts` - 重いマッチング処理用Web Worker

### 技術要件

- 完全基準ベース一次マッチング（金額、日付、ベンダー）
- 許容度付きファジー基準ベース二次マッチング
- エッジケースと部分マッチ用フォールバックマッチング
- 設定可能ステージ閾値と重み
- パフォーマンス用パイプライン最適化
- ステージ固有信頼度スコアリング
- 動的ステージ有効化/無効化

### マルチステージパイプラインアーキテクチャ

```typescript
interface MatchingStage {
  name: string;
  criteria: MatchingCriteria[];
  threshold: number;
  weight: number;
  enabled: boolean;
  priority: number;
  timeout: number;
}

interface MatchingPipeline {
  stages: MatchingStage[];
  execute(receipt: Receipt, transactions: Transaction[]): Promise<MatchingResult[]>;
  optimizeStages(performanceData: PerformanceMetric[]): Promise<MatchingStage[]>;
  addStage(stage: MatchingStage): void;
  removeStage(stageName: string): void;
  reorderStages(stageOrder: string[]): void;
}

interface MatchingCriteria {
  field: 'amount' | 'date' | 'vendor' | 'description' | 'category';
  matchType: 'exact' | 'fuzzy' | 'range' | 'similarity';
  tolerance: number;
  weight: number;
  required: boolean;
}
```

### パイプラインステージ実装

```typescript
class ExactMatchingStage implements MatchingStage {
  name = 'exact_matching';

  async execute(receipt: Receipt, transactions: Transaction[]): Promise<MatchingResult[]> {
    // 金額、日付、ベンダーの完全マッチング
    return transactions
      .filter(t => this.isExactMatch(receipt, t))
      .map(t => ({ transaction: t, confidence: 1.0, stage: this.name }));
  }

  private isExactMatch(receipt: Receipt, transaction: Transaction): boolean {
    return (
      receipt.amount === transaction.amount &&
      this.datesMatch(receipt.date, transaction.date) &&
      this.vendorsMatch(receipt.vendor, transaction.vendor)
    );
  }
}

class FuzzyMatchingStage implements MatchingStage {
  name = 'fuzzy_matching';

  async execute(receipt: Receipt, transactions: Transaction[]): Promise<MatchingResult[]> {
    // 許容度付きファジーマッチング
    return transactions
      .map(t => ({
        transaction: t,
        confidence: this.calculateFuzzyConfidence(receipt, t),
        stage: this.name,
      }))
      .filter(result => result.confidence >= this.threshold);
  }

  private calculateFuzzyConfidence(receipt: Receipt, transaction: Transaction): number {
    const amountScore = this.calculateAmountSimilarity(receipt.amount, transaction.amount);
    const dateScore = this.calculateDateSimilarity(receipt.date, transaction.date);
    const vendorScore = this.calculateVendorSimilarity(receipt.vendor, transaction.vendor);

    return amountScore * 0.4 + dateScore * 0.3 + vendorScore * 0.3;
  }
}

class FallbackMatchingStage implements MatchingStage {
  name = 'fallback_matching';

  async execute(receipt: Receipt, transactions: Transaction[]): Promise<MatchingResult[]> {
    // エッジケースと部分マッチング
    return transactions
      .map(t => ({
        transaction: t,
        confidence: this.calculateFallbackConfidence(receipt, t),
        stage: this.name,
      }))
      .filter(result => result.confidence >= this.threshold)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // 上位3候補のみ
  }
}
```

### パイプライン最適化

```typescript
class PipelineOptimizer {
  // パフォーマンスデータに基づくステージ最適化
  async optimizeStages(stages: MatchingStage[], performanceData: PerformanceMetric[]): Promise<MatchingStage[]> {
    // 処理時間と精度のバランスを最適化
    return stages.map(stage => ({
      ...stage,
      threshold: this.optimizeThreshold(stage, performanceData),
      weight: this.optimizeWeight(stage, performanceData),
      enabled: this.shouldEnableStage(stage, performanceData),
    }));
  }

  // 動的ステージ順序最適化
  async optimizeStageOrder(stages: MatchingStage[]): Promise<MatchingStage[]> {
    // 成功率と処理時間に基づいてステージを並び替え
    return stages.sort((a, b) => {
      const aEfficiency = a.successRate / a.averageProcessingTime;
      const bEfficiency = b.successRate / b.averageProcessingTime;
      return bEfficiency - aEfficiency;
    });
  }
}
```

### セキュリティ考慮事項

- マッチングデータの安全な処理
- ステージ設定変更の権限制御
- 機密な取引情報の保護
- パイプライン設定の改ざん防止

### パフォーマンス最適化

- 早期終了による無駄な処理の回避
- ステージ並列実行による高速化
- マッチング結果のキャッシュ
- 効率的候補フィルタリング
- メモリ使用量最適化

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] 一次完全マッチングが高精度結果を提供する
- [ ] 二次ファジーマッチングが近似マッチを発見する
- [ ] フォールバックマッチングがエッジケースを処理する
- [ ] ステージ設定が動的に調整可能である
- [ ] パイプライン最適化がパフォーマンスを向上させる
- [ ] ステージ固有信頼度が適切に計算される
- [ ] 全体的なマッチング精度が向上する

## 依存関係

- **必須**: PBI-4-3-1 - 高度マッチング技術

## テスト要件

- Unit Tests (Vitest): 個別ステージロジック、パイプライン実行、最適化アルゴリズム
- Integration Tests (Testing Library): 完全なパイプラインワークフロー
- Performance Tests: 大容量データセットでのパイプライン速度
- Accuracy Tests: 各ステージとパイプライン全体の精度測定

### テストカバレッジ要件

- ステージ実装: 100%
- パイプライン実行: 95%
- 最適化ロジック: 90%
- エラー処理: 95%

## 見積もり

2 ストーリーポイント

## 優先度

高 - 包括的マッチングカバレッジに必須

## 実装ノート

- ステージ追加の容易性を確保する拡張可能設計
- パフォーマンス監視による継続的最適化
- ステージ間でのコンテキスト情報共有
- 失敗したマッチングの詳細ログ記録
- A/Bテスト用の設定可能パイプラインバリアント
