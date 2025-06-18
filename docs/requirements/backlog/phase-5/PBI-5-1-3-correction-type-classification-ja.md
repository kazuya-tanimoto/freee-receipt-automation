# PBI-5-1-3: 修正タイプ分類システム

## 説明

ユーザー修正の自動分類システムを実装し、実行された調整のタイプ（日付、金額、仕入先、カテゴリ、マッチ解除）を分類します。これには検出アルゴリズムと修正分析用のメタデータタグ付けが含まれます。

## 実装詳細

### 作成/変更するファイル

1. `src/lib/corrections/classifier.ts` - 修正タイプ分類ロジック
2. `src/lib/corrections/change-detector.ts` - 変更前後の差分検出
3. `src/types/corrections.ts` - 分類タイプで更新
4. `src/lib/corrections/__tests__/classifier.test.ts` - 単体テスト
5. `src/lib/corrections/metadata-tagger.ts` - メタデータ抽出とタグ付け

### 技術要件

- 変更前後データから修正タイプを自動検出
- 単一調整での複数修正タイプをサポート
- 関連メタデータ（フィールド変更、変更量）を抽出
- 分類に信頼度スコアを割り当て
- エッジケースと曖昧な修正を処理

### 分類アーキテクチャ

```typescript
interface CorrectionClassifier {
  classify(beforeData: CorrectionData, afterData: CorrectionData): ClassificationResult;
  detectChanges(beforeData: CorrectionData, afterData: CorrectionData): FieldChange[];
  extractMetadata(correction: UserCorrection): CorrectionMetadata;
}

interface ClassificationResult {
  primaryType: CorrectionType;
  secondaryTypes: CorrectionType[];
  confidence: number;
  changes: FieldChange[];
  metadata: CorrectionMetadata;
}

interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'add' | 'remove' | 'modify';
  magnitude?: number;
}
```

### 分類ロジック

```typescript
type CorrectionType = 'date' | 'amount' | 'vendor' | 'category' | 'unmatch';

interface CorrectionMetadata {
  dateShift?: number; // 日数
  amountDifference?: number;
  vendorSimilarity?: number;
  categoryChange?: string;
  confidence: number;
  tags: string[];
}
```

## 受け入れ基準

- [ ] データ変更から修正タイプを自動分類する
- [ ] 単一調整での複数修正タイプを検出する
- [ ] 分類の信頼度スコアを計算する
- [ ] 修正から意味のあるメタデータを抽出する
- [ ] エッジケースと曖昧な修正を処理する
- [ ] 関連属性で修正をタグ付けする

## 依存関係

- **必須**: PBI-5-1-1 (修正データテーブル)

## テスト要件

- 単体テスト: 分類アルゴリズムとエッジケース
- 統合テスト: 実際の修正データでの分類
- テストデータ: 様々な修正シナリオと組み合わせ

## 見積もり

1ストーリーポイント

## 優先度

中 - 修正分析に重要

## 実装ノート

- 仕入先名変更にファジーマッチングを使用
- 閾値ベースの分類信頼度を実装
- 複雑な分類に機械学習を検討
