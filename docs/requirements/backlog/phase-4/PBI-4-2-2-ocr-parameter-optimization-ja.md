# PBI-4-2-2: OCRパラメータ最適化

## 説明

レシート画像での最大テキスト認識精度のためのOCRエンジンパラメータと設定の最適化を行い、
言語設定、認識モード、信頼度しきい値、エンジン固有のチューニングを含みます。

## 実装詳細

### 作成/修正するファイル

1. `src/services/ocr/optimization/ParameterOptimizer.ts` - OCRパラメータ最適化サービス
2. `src/services/ocr/optimization/profiles/` - 事前設定済み最適化プロファイル
3. `src/config/ocr-parameters.ts` - OCRパラメータ設定
4. `src/lib/ocr/tesseract-config.ts` - Tesseract固有設定
5. `src/lib/ocr/performance-metrics.ts` - OCRパフォーマンス測定
6. `src/services/ocr/optimization/AutoTuner.ts` - 自動パラメータチューニング
7. `src/hooks/useOCROptimization.ts` - OCR最適化用Reactフック
8. `src/api/ocr/optimize.ts` - OCR最適化APIエンドポイント

### 技術要件

- Tesseract.js v4+パラメータ最適化
- 多言語サポート（英語、日本語、数字）
- 画像特性に基づく動的パラメータ調整
- パラメータセット用A/Bテストフレームワーク
- パフォーマンス監視とメトリクス収集
- 成功率に基づく自動最適化
- 異なるレシートタイプ用設定プロファイル

### OCRパラメータ設定

```typescript
interface OCRParameters {
  languages: string[]; // ['eng', 'jpn', 'jpn_vert']
  engineMode: "LEGACY" | "NEURAL_NETS" | "DEFAULT" | "COMBINED";
  pageSegMode: number; // 0-13, PSMモード
  ocrEngineMode: number; // 0-3, OEMモード
  whiteList: string; // 認識する文字
  blackList: string; // 無視する文字
  minConfidence: number; // 0-100
  timeoutMs: number;
  customParameters: Record<string, string | number>;
}

interface OptimizationProfile {
  name: string;
  description: string;
  targetReceiptType:
    | "general"
    | "amazon"
    | "apple"
    | "gas_station"
    | "restaurant";
  parameters: OCRParameters;
  expectedAccuracy: number;
  averageProcessingTime: number;
}

interface OCROptimizationResult {
  originalParameters: OCRParameters;
  optimizedParameters: OCRParameters;
  accuracyImprovement: number;
  processingTimeChange: number;
  confidenceScores: {
    before: number;
    after: number;
  };
  testResults: {
    totalTests: number;
    successfulExtractions: number;
    averageConfidence: number;
  };
}
```

### パラメータ最適化エンジン

```typescript
class OCRParameterOptimizer {
  // 特定のレシートタイプ用パラメータ最適化
  async optimizeForReceiptType(
    images: ImageData[],
    receiptType: string,
  ): Promise<OCRParameters>;

  // 異なるパラメータセットのA/Bテスト
  async compareParameterSets(
    parameterSets: OCRParameters[],
    testImages: ImageData[],
  ): Promise<OptimizationResult[]>;

  // 履歴パフォーマンスに基づくパラメータ自動チューニング
  async autoTuneParameters(
    currentParams: OCRParameters,
    performanceHistory: PerformanceMetric[],
  ): Promise<OCRParameters>;

  // パラメータ有効性の検証
  async validateParameters(
    parameters: OCRParameters,
    validationSet: ImageData[],
  ): Promise<ValidationResult>;
}
```

### 最適化プロファイル

```typescript
const OPTIMIZATION_PROFILES: OptimizationProfile[] = [
  {
    name: "general_receipts",
    description: "汎用レシートOCR",
    targetReceiptType: "general",
    parameters: {
      languages: ["eng"],
      engineMode: "NEURAL_NETS",
      pageSegMode: 6, // 単一均一ブロック
      ocrEngineMode: 3, // デフォルト
      minConfidence: 60,
      whiteList:
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$/¥-: ",
      timeoutMs: 30000,
    },
    expectedAccuracy: 85,
  },
  {
    name: "japanese_receipts",
    description: "日本語レシートOCR最適化",
    targetReceiptType: "general",
    parameters: {
      languages: ["jpn", "eng"],
      engineMode: "NEURAL_NETS",
      pageSegMode: 6,
      ocrEngineMode: 3,
      minConfidence: 55,
      timeoutMs: 45000,
    },
    expectedAccuracy: 80,
  },
];
```

### パフォーマンス監視

- パラメータセットごとのリアルタイム精度トラッキング
- 処理時間測定と最適化
- 信頼度スコア分布分析
- エラーパターン識別と修正
- トレンドに基づく自動パラメータ調整

### 状態管理統合

- 最適化結果キャッシュ用React Query使用
- パラメータ設定用Zustandストア実装
- リアルタイム最適化進捗用WebSocket更新
- 最適化履歴の永続的ストレージ

### セキュリティ考慮事項

- 悪意ある設定を防ぐパラメータ検証
- 最適化リクエストのレート制限
- 最適化結果の安全なストレージ
- カスタムパラメータの入力サニタイゼーション

### パフォーマンス最適化

- より高速な最適化のための並列パラメータテスト
- 最適化結果のキャッシュ
- 増分パラメータ調整
- 大きな画像セットのスマートサンプリング

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] OCRパラメータが異なるレシートタイプに最適化される
- [ ] A/Bテストフレームワークがパラメータ有効性を比較する
- [ ] 自動チューニングが時間とともに精度を向上させる
- [ ] パフォーマンス監視が最適化成功を追跡する
- [ ] 設定プロファイルが主要レシート形式で機能する
- [ ] 処理時間が許容可能な制限内に留まる
- [ ] 最適化結果が永続的で再利用可能である

### 検証コマンド

```bash
npm run test:ocr-optimization
npm run test:parameter-profiles
npm run benchmark:ocr-accuracy
```

## 依存関係

- **必須**: PBI-4-2-1 - 画像前処理パイプライン

## テスト要件

- Unit Tests (Vitest): パラメータ最適化ロジック、プロファイル管理、パフォーマンスメトリクス
- Integration Tests (Testing Library): 完全な最適化ワークフロー
- Performance Tests: OCR精度と速度ベンチマーク
- A/B Tests: パラメータセット有効性比較

### テストカバレッジ要件

- 最適化アルゴリズム: 95%
- パラメータ検証: 100%
- パフォーマンス監視: 90%
- プロファイル管理: 100%

## 見積もり

1 ストーリーポイント

## 優先度

高 - OCR精度最大化に重要

## 実装ノート

- パフォーマンス劣化を避けるため段階的パラメータ最適化を実装
- A/Bテスト結果に統計的有意性テストを使用
- 精度を低下させるパラメータ変更のロールバック機能を追加
- 異なる画像品質と条件で最適化が機能することを確保
- 最適化問題のデバッグ用適切なログを実装
