# PBI-4-3-4: マッチングパフォーマンス最適化

## 説明

大容量データセット向けマッチングアルゴリズムパフォーマンス最適化。インデックス化、キャッシュ、並列処理により高速マッチング速度と精度向上を維持。

## 実装詳細

### 作成/修正するファイル

1. `src/services/matching/PerformanceOptimizer.ts` - パフォーマンス最適化サービス
2. `src/services/matching/indexing/` - インデックス化システム実装
3. `src/services/matching/caching/` - キャッシュ管理システム
4. `src/lib/matching/parallel-processing.ts` - 並列処理ユーティリティ
5. `src/lib/matching/smart-filtering.ts` - スマートフィルタリングアルゴリズム
6. `src/workers/matching-optimization.worker.ts` - 最適化処理用Web Worker
7. `src/hooks/useMatchingPerformance.ts` - パフォーマンス監視用Reactフック
8. `src/api/matching/performance.ts` - パフォーマンスAPI エンドポイント

### 技術要件

- 高速取引検索用データベースインデックス化
- マッチング結果のインテリジェントキャッシュ
- 複数レシート用並列処理
- マッチング候補を削減するスマートフィルタリング
- パフォーマンス監視と最適化
- 大容量データセット用メモリ効率的マッチング
- 適応的最適化アルゴリズム

### パフォーマンスアーキテクチャ

```typescript
interface MatchingOptimizer {
  indexTransactions(transactions: Transaction[]): Promise<void>;
  cacheMatchingResults(results: MatchingResult[]): Promise<void>;
  parallelMatch(receipts: Receipt[]): Promise<MatchingResult[]>;
  filterCandidates(receipt: Receipt, transactions: Transaction[]): Transaction[];
  optimizeMatchingStrategy(performanceData: PerformanceData): Promise<OptimizationResult>;
}

interface PerformanceMetrics {
  averageMatchingTime: number;
  throughput: number;
  cacheHitRate: number;
  indexEfficiency: number;
  memoryUsage: number;
  parallelizationEfficiency: number;
}

interface OptimizationStrategy {
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedImprovement: number;
  implementationCost: number;
}
```

### インデックス化システム

```typescript
class TransactionIndexer {
  // 金額範囲インデックス
  private amountIndex: Map<string, Transaction[]> = new Map();

  // 日付範囲インデックス
  private dateIndex: Map<string, Transaction[]> = new Map();

  // ベンダー名インデックス
  private vendorIndex: Map<string, Transaction[]> = new Map();

  // 複合インデックス
  private compositeIndex: Map<string, Transaction[]> = new Map();

  async buildIndexes(transactions: Transaction[]): Promise<void> {
    // 並列インデックス構築
    await Promise.all([
      this.buildAmountIndex(transactions),
      this.buildDateIndex(transactions),
      this.buildVendorIndex(transactions),
      this.buildCompositeIndex(transactions),
    ]);
  }

  async findCandidates(receipt: Receipt): Promise<Transaction[]> {
    // インデックスを使用した高速候補検索
    const amountCandidates = this.findByAmountRange(receipt.amount);
    const dateCandidates = this.findByDateRange(receipt.date);
    const vendorCandidates = this.findByVendorSimilarity(receipt.vendor);

    // 交差による候補絞り込み
    return this.intersectCandidates([amountCandidates, dateCandidates, vendorCandidates]);
  }
}
```

### キャッシュシステム

```typescript
class MatchingCache {
  private cache: Map<string, CachedMatchingResult> = new Map();
  private cacheStats: CacheStatistics = new CacheStatistics();

  // LRU キャッシュ実装
  async getMatchingResult(cacheKey: string): Promise<MatchingResult | null> {
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      this.cacheStats.recordHit();
      this.updateAccessTime(cached);
      return cached.result;
    }

    this.cacheStats.recordMiss();
    return null;
  }

  async cacheMatchingResult(cacheKey: string, result: MatchingResult, ttl: number = 3600000): Promise<void> {
    // キャッシュサイズ制限チェック
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
    });
  }

  // キャッシュキー生成
  generateCacheKey(receipt: Receipt, filters: MatchingFilters): string {
    return `${receipt.id}_${receipt.amount}_${receipt.date.getTime()}_${JSON.stringify(filters)}`;
  }
}
```

### 並列処理システム

```typescript
class ParallelMatchingProcessor {
  private workerPool: Worker[] = [];
  private maxWorkers: number = navigator.hardwareConcurrency || 4;

  async parallelMatch(receipts: Receipt[]): Promise<MatchingResult[]> {
    // レシートをチャンクに分割
    const chunks = this.chunkReceipts(receipts, this.maxWorkers);

    // 並列処理実行
    const matchingPromises = chunks.map((chunk, index) => this.processChunkWithWorker(chunk, index));

    const results = await Promise.all(matchingPromises);
    return results.flat();
  }

  private async processChunkWithWorker(receipts: Receipt[], workerIndex: number): Promise<MatchingResult[]> {
    const worker = this.getOrCreateWorker(workerIndex);

    return new Promise((resolve, reject) => {
      worker.postMessage({
        type: 'MATCH_RECEIPTS',
        receipts,
        timestamp: Date.now(),
      });

      worker.onmessage = event => {
        if (event.data.type === 'MATCHING_COMPLETE') {
          resolve(event.data.results);
        }
      };

      worker.onerror = reject;
    });
  }
}
```

### スマートフィルタリング

```typescript
class SmartFilter {
  // 事前フィルタリングで候補数を削減
  async filterTransactionCandidates(receipt: Receipt, transactions: Transaction[]): Promise<Transaction[]> {
    // 段階的フィルタリング（早期終了で高速化）
    let candidates = transactions;

    // 金額範囲フィルタ（最も選択的）
    candidates = this.filterByAmountRange(receipt, candidates);
    if (candidates.length === 0) return [];

    // 日付範囲フィルタ
    candidates = this.filterByDateRange(receipt, candidates);
    if (candidates.length === 0) return [];

    // ベンダー類似性フィルタ
    candidates = this.filterByVendorSimilarity(receipt, candidates);

    // 最大候補数制限
    return candidates.slice(0, this.maxCandidates);
  }

  // 適応的フィルタ閾値調整
  async adaptFilterThresholds(performanceData: PerformanceData): Promise<void> {
    const optimalThresholds = this.calculateOptimalThresholds(performanceData);
    this.updateFilterThresholds(optimalThresholds);
  }
}
```

### メモリ最適化

```typescript
class MemoryOptimizer {
  // ストリーミング処理で大容量データを処理
  async streamingMatch(
    receiptStream: AsyncIterable<Receipt>,
    transactionIndex: TransactionIndex
  ): Promise<AsyncIterable<MatchingResult>> {
    return {
      async *[Symbol.asyncIterator]() {
        for await (const receipt of receiptStream) {
          const candidates = await transactionIndex.findCandidates(receipt);
          const results = await this.matchReceiptWithCandidates(receipt, candidates);
          yield* results;
          this.cleanupTemporaryData();
        }
      },
    };
  }

  // オブジェクトプール使用でガベージコレクション削減
  private objectPool: Map<string, any[]> = new Map();

  borrowObject<T>(type: string): T {
    const pool = this.objectPool.get(type) || [];
    return pool.pop() || this.createNewObject<T>(type);
  }
}
```

### セキュリティ・パフォーマンス考慮事項

- インデックス化データの安全保存、キャッシュ暗号化、並列処理データ分離
- データベースクエリ最適化、メモリ使用量監視、CPU適応制御

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] マッチング処理時間が大幅に短縮される
- [ ] 大容量データセットが効率的に処理される
- [ ] キャッシュシステムがレスポンス時間を改善する
- [ ] 並列処理が利用可能リソースを最大活用する
- [ ] スマートフィルタリングが候補数を適切に削減する
- [ ] メモリ使用量が最適化される
- [ ] パフォーマンス監視が継続的改善を支援する

## 依存関係

- **必須**: PBI-4-3-1 - 高度マッチング技術
- **必須**: PBI-4-3-2 - マルチステージマッチングパイプライン

## テスト要件

- Unit Tests (Vitest): インデックス化、キャッシュ、フィルタリングアルゴリズム
- Performance Tests: 大容量データセットでのスピードベンチマーク
- Load Tests: 高負荷下でのシステム安定性
- Memory Tests: メモリ使用量と漏洩チェック

### テストカバレッジ要件

- 最適化アルゴリズム: 95%
- キャッシュシステム: 100%
- 並列処理: 90%
- インデックス化: 100%

## 見積もり

1 ストーリーポイント

## 優先度

中 - スケーラビリティに重要

## 実装ノート

- 段階的最適化による既存機能への影響最小化
- パフォーマンステストによる改善効果の定量的測定
- 異なるデータサイズでの最適化戦略の検証
- メモリとCPU使用量の継続的監視
- 本番環境でのパフォーマンス指標継続追跡
