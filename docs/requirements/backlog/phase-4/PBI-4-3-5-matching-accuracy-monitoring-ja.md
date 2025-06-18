# PBI-4-3-5: マッチング精度モニタリングと分析

## 説明

リアルタイムメトリクス、A/Bテストフレームワーク、分析ダッシュボードを含む包括的マッチング精度モニタリングシステムを実装し、マッチングアルゴリズムパフォーマンスを継続的に改善します。

## 実装詳細

### 作成/修正するファイル

1. `src/services/monitoring/MatchingAccuracyMonitor.ts` - マッチング精度監視サービス
2. `src/services/monitoring/MatchingMetricsCollector.ts` - メトリクス収集システム
3. `src/services/testing/MatchingABTestFramework.ts` - マッチング用A/Bテストフレームワーク
4. `src/components/dashboard/MatchingAnalytics.tsx` - マッチング分析ダッシュボード
5. `src/lib/metrics/matching-calculator.ts` - マッチング精度計算ユーティリティ
6. `src/hooks/useMatchingMetrics.ts` - マッチングメトリクス用Reactフック
7. `src/api/monitoring/matching-metrics.ts` - マッチングメトリクスAPI
8. `src/workers/matching-analytics.worker.ts` - 分析処理用Web Worker

### 技術要件

- リアルタイムマッチング精度追跡
- アルゴリズム改善用A/Bテストフレームワーク
- パフォーマンス分析ダッシュボード
- エラーパターン分析とレポート
- 自動精度回帰検出
- ユーザーフィードバックと精度検証の統合
- 履歴傾向分析とアラート

### モニタリングアーキテクチャ

```typescript
interface MatchingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  processingTime: number;
  confidence: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  userCorrectionRate: number;
  algorithmStageMetrics: StageMetrics[];
}

interface AccuracyMonitor {
  trackMatching(result: MatchingResult): Promise<void>;
  getMetrics(timeRange: DateRange): Promise<MatchingMetrics>;
  detectRegressions(): Promise<RegressionAlert[]>;
  runABTest(testConfig: ABTestConfig): Promise<ABTestResult>;
  generateAccuracyReport(period: string): Promise<AccuracyReport>;
  analyzeUserCorrections(corrections: UserCorrection[]): Promise<CorrectionAnalysis>;
}

interface MatchingABTestConfig {
  name: string;
  description: string;
  algorithms: MatchingAlgorithmVariant[];
  sampleSize: number;
  duration: number;
  successMetrics: ('accuracy' | 'precision' | 'recall' | 'speed')[];
  confidenceLevel: number;
}
```

### 精度計算エンジン

```typescript
class MatchingAccuracyCalculator {
  // 全体的マッチング精度計算
  calculateOverallAccuracy(results: MatchingResult[], groundTruth: GroundTruth[]): number {
    const correctMatches = results.filter(r => this.isCorrectMatch(r, groundTruth));
    return correctMatches.length / results.length;
  }

  // 精密度（Precision）計算
  calculatePrecision(results: MatchingResult[], groundTruth: GroundTruth[]): number {
    const truePositives = results.filter(r => this.isTruePositive(r, groundTruth));
    const falsePositives = results.filter(r => this.isFalsePositive(r, groundTruth));
    return truePositives.length / (truePositives.length + falsePositives.length);
  }

  // 再現率（Recall）計算
  calculateRecall(results: MatchingResult[], groundTruth: GroundTruth[]): number {
    const truePositives = results.filter(r => this.isTruePositive(r, groundTruth));
    const falseNegatives = groundTruth.filter(gt => !this.hasMatchingResult(gt, results));
    return truePositives.length / (truePositives.length + falseNegatives.length);
  }

  // F1スコア計算
  calculateF1Score(precision: number, recall: number): number {
    return (2 * (precision * recall)) / (precision + recall);
  }

  // 信頼度別精度分析
  analyzeAccuracyByConfidence(results: MatchingResult[]): ConfidenceAccuracyAnalysis {
    const confidenceBuckets = this.groupByConfidenceBuckets(results);
    return confidenceBuckets.map(bucket => ({
      confidenceRange: bucket.range,
      accuracy: this.calculateBucketAccuracy(bucket.results),
      count: bucket.results.length,
    }));
  }
}
```

### エラーパターン分析

```typescript
class MatchingErrorAnalyzer {
  // マッチングエラーパターン検出
  async analyzeErrorPatterns(failedMatches: MatchingResult[], corrections: UserCorrection[]): Promise<ErrorPattern[]> {
    const patterns = [
      await this.analyzeAmountMismatchPatterns(failedMatches),
      await this.analyzeDateMismatchPatterns(failedMatches),
      await this.analyzeVendorMismatchPatterns(failedMatches),
    ].flat();

    return this.rankPatternsByFrequency(patterns);
  }

  // 繰り返しエラーの識別
  async identifyRecurringErrors(errorHistory: MatchingError[]): Promise<RecurringError[]> {
    const groupedErrors = this.groupErrorsByCharacteristics(errorHistory);
    return groupedErrors
      .filter(group => group.frequency > this.recurringThreshold)
      .map(group => ({
        pattern: group.pattern,
        frequency: group.frequency,
        impact: this.calculateErrorImpact(group.errors),
      }));
  }
}
```

### A/Bテストフレームワーク

```typescript
class MatchingABTestFramework {
  // マッチングアルゴリズムA/Bテスト実行
  async runMatchingABTest(config: MatchingABTestConfig): Promise<ABTestResult> {
    const testGroups = await this.createTestGroups(config);
    const results = await Promise.all(testGroups.map(group => this.runTestGroup(group, config)));

    return {
      testId: config.name,
      results,
      winner: this.determineWinner(results, config.successMetrics),
      statisticalSignificance: this.calculateSignificance(results),
      recommendation: this.generateRecommendation(results),
    };
  }

  // 統計的有意性検定
  private calculateSignificance(results: TestGroupResult[]): StatisticalSignificance {
    const controlGroup = results.find(r => r.variant === 'control');
    const testGroups = results.filter(r => r.variant !== 'control');

    return testGroups.map(testGroup => ({
      variant: testGroup.variant,
      pValue: this.performTTest(controlGroup.metrics, testGroup.metrics),
      confidenceInterval: this.calculateConfidenceInterval(testGroup.metrics),
      isSignificant: this.isStatisticallySignificant(controlGroup.metrics, testGroup.metrics),
    }));
  }
}
```

### 回帰検出システム

```typescript
class MatchingRegressionDetector {
  // マッチング精度回帰検出
  async detectAccuracyRegression(
    currentMetrics: MatchingMetrics,
    historicalMetrics: MatchingMetrics[]
  ): Promise<RegressionAlert[]> {
    const alerts: RegressionAlert[] = [];

    // 精度低下検出
    const accuracyRegression = this.detectMetricRegression(
      currentMetrics.accuracy,
      historicalMetrics.map(m => m.accuracy),
      'accuracy'
    );
    if (accuracyRegression) alerts.push(accuracyRegression);

    // 処理時間増加検出
    const performanceRegression = this.detectMetricRegression(
      currentMetrics.processingTime,
      historicalMetrics.map(m => m.processingTime),
      'processingTime'
    );
    if (performanceRegression) alerts.push(performanceRegression);

    return alerts;
  }

  // 自動アラート生成
  async generateRegressionAlerts(regressions: RegressionAlert[]): Promise<void> {
    for (const regression of regressions) {
      await this.sendAlert({
        type: 'regression',
        severity: regression.severity,
        message: `マッチング${regression.metric}の回帰検出: ${regression.changePercent}%低下`,
        suggestions: regression.suggestedActions,
        timestamp: new Date(),
      });
    }
  }
}
```

### セキュリティ・パフォーマンス考慮事項

- メトリクス収集時の個人情報保護、分析データアクセス権限制御
- 効率的サンプリング、大容量データ処理最適化、並列分析処理

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] マッチング精度がリアルタイムで追跡される
- [ ] A/Bテストフレームワークがアルゴリズム改善を支援する
- [ ] エラーパターン分析が改善領域を特定する
- [ ] 回帰検出が精度低下を自動識別する
- [ ] ユーザー修正が精度検証に統合される
- [ ] ダッシュボードが包括的な洞察を提供する
- [ ] アラートシステムが重要な変化を通知する

## 依存関係

- **必須**: PBI-4-3-2 - マルチステージマッチングパイプライン
- **必須**: PBI-4-3-3 - 競合解決システム

## テスト要件

- Unit Tests (Vitest): 精度計算、エラー分析、回帰検出アルゴリズム
- Integration Tests (Testing Library): 完全なモニタリングワークフロー
- Performance Tests: 大容量メトリクスデータ処理
- UI Tests: 分析ダッシュボードコンポーネント

### テストカバレッジ要件

- 精度計算: 100%
- エラー分析: 95%
- 回帰検出: 100%
- A/Bテストフレームワーク: 90%

## 見積もり

1 ストーリーポイント

## 優先度

中 - 継続的改善に重要

## 実装ノート

- モニタリングがマッチング処理パフォーマンスに影響しないよう最適化
- 統計的に有意な結果のための適切なサンプルサイズ確保
- ダッシュボードでの直感的なデータ視覚化
- アラート疲れを避けるためのスマートアラート閾値
- マッチング改善のための実用的な洞察提供
