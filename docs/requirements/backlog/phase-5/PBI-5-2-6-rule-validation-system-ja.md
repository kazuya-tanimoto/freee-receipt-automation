# PBI-5-2-6: ルール検証・テストシステム

## 説明

生成されたルールを履歴データに対してテストし、ルールロジックを検証し、アクティブ化前にルール品質を保証する包括的なルール検証システムを実装します。これにより、パフォーマンスが低いルールがマッチング精度に影響することを防ぎます。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/rule-validator.ts` - コアルール検証ロジック
2. `src/lib/rules/historical-tester.ts` - 履歴データテスト
3. `src/lib/rules/rule-quality-checker.ts` - ルール品質評価
4. `src/types/validation.ts` - 検証結果タイプ
5. `src/lib/rules/__tests__/rule-validator.test.ts` - 単体テスト

### 技術要件

- ルール構文と論理一貫性を検証
- 履歴修正データに対してルールをテスト
- ルール精度とパフォーマンス指標を計算
- ルール有効性のクロスバリデーションを実装
- ルール比較のA/Bテストフレームワークをサポート

### 検証アーキテクチャ

```typescript
interface RuleValidator {
  validateRule(rule: MatchingRule): ValidationResult;
  testAgainstHistory(rule: MatchingRule, testData: TestDataset): HistoricalTestResult;
  assessRuleQuality(rule: MatchingRule): QualityAssessment;
  performCrossValidation(rule: MatchingRule, folds: number): CrossValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  qualityScore: number;
}

interface HistoricalTestResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  confusion_matrix: ConfusionMatrix;
}
```

### 品質評価

```typescript
interface QualityAssessment {
  overallScore: number; // 0-100
  criteria: QualityCriteria[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

interface QualityCriteria {
  name: string;
  score: number;
  weight: number;
  passed: boolean;
  description: string;
}
```

## 受け入れ基準

- [ ] ルール構文と論理一貫性を検証
- [ ] 履歴データに対してルールパフォーマンスをテスト
- [ ] 精度、適合率、再現率、F1スコアを計算
- [ ] k-分割クロスバリデーションを実行
- [ ] ルール品質スコアと改善提案を提供
- [ ] 統計的に有意でないルールを検出・拒否

## 依存関係

- **必須**: PBI-5-2-5 (ルール信頼度スコアリング)
- **必須**: PBI-5-1-2 (修正データ収集API)

## テスト要件

- 単体テスト: 検証ロジックと品質評価
- 統合テスト: 履歴データでのルールテスト
- テストデータ: 様々な品質レベルのルールとエッジケース

## 見積もり

2ストーリーポイント

## 優先度

高 - ルール品質保証に重要

## 実装ノート

- 機械学習モデル評価指標を活用
- 時系列クロスバリデーション（時間リーク防止）
- 統計的有意性検定（McNemar検定など）
- ルール複雑度とオーバーフィッティング検出
