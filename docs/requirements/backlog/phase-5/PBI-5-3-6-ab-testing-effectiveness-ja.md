# PBI-5-3-6: A/Bテスト・効果測定

## 説明

基本アルゴリズムと比較したルールベースマッチング効果を測定するA/Bテストフレームワークを実装し、パフォーマンス改善を追跡し、統計的有意性をもって25%精度向上目標を検証します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/testing/ab-test-framework.ts` - A/Bテストフレームワーク
2. `src/lib/testing/effectiveness-tracker.ts` - パフォーマンス追跡
3. `src/lib/testing/statistical-analyzer.ts` - 統計分析
4. `src/lib/testing/experiment-manager.ts` - 実験管理
5. `src/lib/testing/__tests__/ab-testing.test.ts` - 単体テスト

### 技術要件

- ルール vs 基本マッチングのA/Bテストを実装
- 統計的有意性をもって精度改善を追跡
- 制御実験ロールアウトをサポート
- 複数のパフォーマンス指標を測定
- 包括的な効果レポートを生成

### A/Bテストアーキテクチャ

```typescript
interface ABTestFramework {
  createExperiment(config: ExperimentConfig): Promise<Experiment>;
  assignUserToGroup(userId: string, experimentId: string): TestGroup;
  trackMatchingResult(
    result: MatchingResult,
    experimentId: string,
  ): Promise<void>;
  analyzeExperimentResults(experimentId: string): Promise<ExperimentAnalysis>;
}

interface ExperimentConfig {
  name: string;
  description: string;
  controlGroup: MatchingStrategy;
  treatmentGroup: MatchingStrategy;
  trafficSplit: number; // 0-100
  successMetrics: SuccessMetric[];
  duration: number; // days
  minSampleSize: number;
}

interface ExperimentAnalysis {
  experimentId: string;
  status: ExperimentStatus;
  results: GroupComparison;
  statisticalSignificance: SignificanceTest;
  recommendations: string[];
}
```

### 効果測定

```typescript
interface EffectivenessTracker {
  trackMatchingAccuracy(
    result: MatchingResult,
    group: TestGroup,
  ): Promise<void>;
  calculateAccuracyImprovement(
    experimentId: string,
  ): Promise<AccuracyImprovement>;
  generateEffectivenessReport(
    experimentId: string,
  ): Promise<EffectivenessReport>;
}

interface AccuracyImprovement {
  baseline: number;
  treatment: number;
  improvement: number; // percentage
  confidenceInterval: [number, number];
  statisticalSignificance: boolean;
}
```

## 受け入れ基準

- [ ] ルール vs 基本アルゴリズムのA/Bテスト実装
- [ ] 25%精度向上目標の統計的検証
- [ ] 制御されたトラフィック分割とユーザーセグメンテーション
- [ ] 複数成功指標（精度、適合率、再現率、F1）の測定
- [ ] 統計的有意性検定と信頼区間計算
- [ ] 実験結果の包括的レポート生成

## 依存関係

- **必須**: PBI-5-3-4 (マッチングパイプライン統合)
- **必須**: Phase 4基本マッチングアルゴリズム

## テスト要件

- 統合テスト: A/Bテストフレームワークと実験管理
- 統計テスト: 有意性検定とサンプルサイズ計算
- データ品質テスト: 実験データの整合性と完全性

## 見積もり

2ストーリーポイント

## 優先度

高 - 効果検証と目標達成証明に重要

## 実装ノート

- ベイズ統計手法による継続的実験分析
- 多重比較補正（複数指標テスト）
- 実験汚染防止のための厳密なユーザーセグメンテーション
- リアルタイム実験監視とアーリーストッピング
