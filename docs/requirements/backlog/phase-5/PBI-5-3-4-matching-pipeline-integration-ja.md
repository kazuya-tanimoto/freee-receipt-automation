# PBI-5-3-4: マッチングパイプライン統合

## 説明

ルールベースマッチングエンジンを既存のレシート-取引マッチングパイプラインに統合し、後方互換性とパフォーマンスを維持しながら前処理・後処理ルール適用フェーズを実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/matching/pipeline-integrator.ts` - パイプライン統合ロジック
2. `src/lib/matching/rule-matcher.ts` - ルールベースマッチングコンポーネント
3. `src/lib/matching/hybrid-matcher.ts` - ルール＋アルゴリズム組み合わせマッチング
4. `src/lib/matching/pipeline-orchestrator.ts` - マッチングワークフロー編成
5. `src/lib/matching/__tests__/pipeline-integration.test.ts` - 統合テスト

### 技術要件

- 既存マッチングパイプラインにルールエンジンを統合
- 前マッチング・後マッチングルール適用をサポート
- Phase 4マッチングアルゴリズムとの互換性を維持
- ルール失敗時のフォールバック機構を実装
- ルール実行でパイプラインパフォーマンスを最適化

### 統合アーキテクチャ

```typescript
interface PipelineIntegrator {
  integrateRuleEngine(
    pipeline: MatchingPipeline,
    ruleEngine: RuleExecutionEngine,
  ): HybridPipeline;
  configureRulePhases(config: RulePhaseConfig): void;
  optimizePipelinePerformance(
    pipeline: HybridPipeline,
  ): PerformanceOptimization;
}

interface HybridPipeline extends MatchingPipeline {
  preMatchingRules: MatchingRule[];
  postMatchingRules: MatchingRule[];
  fallbackMatcher: BasicMatcher;
  performanceMetrics: PipelineMetrics;
}

interface RulePhaseConfig {
  preMatchingEnabled: boolean;
  postMatchingEnabled: boolean;
  ruleTimeout: number;
  fallbackOnRuleFailure: boolean;
  maxRulesPerPhase: number;
}
```

### パイプライン編成

```typescript
interface PipelineOrchestrator {
  orchestrateMatching(
    receipt: Receipt,
    transactions: Transaction[],
  ): Promise<MatchingResult>;
  executePreMatchingRules(context: MatchingContext): Promise<PreMatchingResult>;
  executePostMatchingRules(
    result: BasicMatchingResult,
  ): Promise<EnhancedMatchingResult>;
  handleRuleFailures(failures: RuleFailure[]): Promise<FallbackResult>;
}

interface MatchingContext {
  receipt: Receipt;
  transactions: Transaction[];
  userPreferences: UserPreferences;
  historicalData: HistoricalMatchingData;
}
```

## 受け入れ基準

- [ ] 既存パイプラインにルールエンジンを透明に統合
- [ ] 前マッチング・後マッチングフェーズでのルール実行
- [ ] Phase 4アルゴリズムとの後方互換性を維持
- [ ] ルール失敗時の堅牢なフォールバック処理
- [ ] ルール統合後のパフォーマンス劣化なし
- [ ] 段階的ロールアウトとA/Bテストサポート

## 依存関係

- **必須**: PBI-5-3-1 (ルール実行エンジン)
- **必須**: Phase 4マッチングアルゴリズム

## テスト要件

- 統合テスト: ルールとアルゴリズムの組み合わせマッチング
- パフォーマンステスト: 統合後のパイプライン効率
- 回帰テスト: 既存機能への影響なし

## 見積もり

3ストーリーポイント

## 優先度

高 - システム統合に重要

## 実装ノート

- 段階的ロールアウト戦略（ルール適用の％）
- 詳細なパフォーマンス監視とアラート
- 統合前後の精度比較メトリクス
- エラー分離とサーキットブレーカーパターン
