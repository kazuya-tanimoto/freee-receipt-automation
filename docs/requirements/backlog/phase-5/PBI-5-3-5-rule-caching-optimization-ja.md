# PBI-5-3-5: ルール実行キャッシュ・パフォーマンス最適化

## 説明

ルール結果キャッシュ、クエリ最適化、バッチ処理、インテリジェント先読みを含む、ルール実行の包括的キャッシュとパフォーマンス最適化を実装し、ルール実行レイテンシを最小化します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/rule-cache.ts` - ルール実行結果キャッシュ
2. `src/lib/rules/performance-optimizer.ts` - ルールパフォーマンス最適化
3. `src/lib/rules/batch-processor.ts` - バッチルール実行
4. `src/lib/rules/query-optimizer.ts` - データベースクエリ最適化
5. `src/lib/rules/__tests__/performance-optimization.test.ts` - パフォーマンステスト

### 技術要件

- TTL付きルール実行結果キャッシュ
- ルールデータのデータベースクエリ最適化
- 複数レシートのバッチ処理を実装
- 頻繁使用ルールのインテリジェント先読み
- ルール実行パフォーマンスの監視・最適化

### キャッシュアーキテクチャ

```typescript
interface RuleCache {
  getCachedResult(cacheKey: string): Promise<CachedRuleResult | null>;
  setCachedResult(
    cacheKey: string,
    result: RuleResult,
    ttl: number,
  ): Promise<void>;
  invalidateCache(pattern: string): Promise<void>;
  generateCacheKey(rule: MatchingRule, context: ExecutionContext): string;
}

interface CachedRuleResult {
  result: RuleResult;
  cachedAt: Date;
  ttl: number;
  hitCount: number;
  contextHash: string;
}

interface PerformanceOptimizer {
  optimizeRuleExecution(rules: MatchingRule[]): OptimizedRuleSet;
  analyzeRulePerformance(
    metrics: RulePerformanceMetrics[],
  ): OptimizationRecommendations;
  implementOptimizations(
    recommendations: OptimizationRecommendations,
  ): Promise<void>;
}
```

### バッチ処理

```typescript
interface BatchProcessor {
  processBatch(
    receipts: Receipt[],
    rules: MatchingRule[],
  ): Promise<BatchResult>;
  optimizeBatchSize(workload: Workload): number;
  prioritizeBatchExecution(batches: Batch[]): PrioritizedBatch[];
}

interface BatchResult {
  results: RuleResult[];
  executionTime: number;
  cacheHitRate: number;
  errors: BatchError[];
}
```

## 受け入れ基準

- [ ] TTL付きルール実行結果の効率的キャッシュ
- [ ] データベースクエリの最適化とインデックス戦略
- [ ] 複数レシートの効率的バッチ処理
- [ ] 使用パターン分析による先読みキャッシュ
- [ ] リアルタイムパフォーマンス監視とアラート
- [ ] キャッシュヒット率と実行時間の大幅改善

## 依存関係

- **必須**: PBI-5-3-1 (ルール実行エンジン)
- **必須**: PBI-5-3-2 (ルール優先順位システム)

## テスト要件

- パフォーマンステスト: キャッシュ効果とレイテンシ改善
- 単体テスト: キャッシュロジックとバッチ処理
- 負荷テスト: 高負荷でのパフォーマンス最適化

## 見積もり

2ストーリーポイント

## 優先度

中 - パフォーマンス向上に重要

## 実装ノート

- Redis/Memcached によるマルチレベルキャッシュ
- クエリ最適化とデータベースインデックス戦略
- メモリ使用量とキャッシュサイズの適応制御
- パフォーマンス回帰の継続監視
