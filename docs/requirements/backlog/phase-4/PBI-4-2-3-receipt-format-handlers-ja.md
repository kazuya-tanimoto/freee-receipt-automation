# PBI-4-2-3: 特定レシートフォーマットハンドラー

## 説明

主要レシートフォーマット（Amazon、Apple、楽天、ガソリンスタンド、サブスクリプション）向けの特定ハンドラーを実装し、フォーマット固有の抽出パターン、検証ルール、精度最適化技術を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/services/ocr/handlers/` - フォーマット固有ハンドラー実装
2. `src/services/ocr/handlers/BaseReceiptHandler.ts` - ベースハンドラークラス
3. `src/services/ocr/detection/FormatDetector.ts` - レシートフォーマット検出
4. `src/lib/ocr/patterns/` - 抽出パターン定義
5. `src/config/receipt-formats.ts` - フォーマット設定
6. `src/services/ocr/validation/FormatValidator.ts` - フォーマット固有検証
7. `src/hooks/useReceiptFormatHandling.ts` - フォーマット処理用Reactフック

### 技術要件

- 各フォーマット用パターンベーステキスト抽出
- 機械学習ベースフォーマット検出
- フォーマットマッチングの信頼度スコアリング
- 認識されないフォーマット用フォールバック処理
- 処理中のリアルタイムフォーマット切り替え
- 新フォーマット用拡張可能アーキテクチャ

### フォーマットハンドラーアーキテクチャ

```typescript
interface ReceiptFormat {
  id: string;
  name: string;
  vendor: string;
  patterns: ExtractionPattern[];
  validation: ValidationRule[];
  confidence: number;
}

interface ExtractionPattern {
  field: 'amount' | 'date' | 'vendor' | 'items' | 'tax';
  regex: RegExp;
  position: 'header' | 'body' | 'footer' | 'any';
  confidence: number;
  transform?: (value: string) => any;
}

abstract class BaseReceiptHandler {
  abstract detect(text: string): Promise<number>; // 信頼度 0-1
  abstract extract(text: string): Promise<ExtractedData>;
  abstract validate(data: ExtractedData): Promise<ValidationResult>;
  abstract optimize(image: ImageData): Promise<ProcessingHints>;
}
```

### 特定ハンドラー

```typescript
class AmazonReceiptHandler extends BaseReceiptHandler {
  // Amazon固有パターンと抽出ロジック
  patterns = {
    orderNumber: /注文番号\s*([A-Z0-9-]+)/i,
    total: /合計金額:\s*￥?([\d,]+\.?\d*)/i,
    date: /注文日:\s*(\d{4}年\d{1,2}月\d{1,2}日)/i,
    items: /^(.+?)\s+￥?([\d,]+\.?\d*)$/gm,
  };
}

class RakutenReceiptHandler extends BaseReceiptHandler {
  // 楽天レシートパターン
  patterns = {
    total: /合計\s*￥?([\d,]+\.?\d*)/i,
    date: /(\d{4}\/\d{1,2}\/\d{1,2})/i,
    items: /^(.+?)\s+￥?([\d,]+\.?\d*)$/gm,
  };
}
```

### セキュリティ考慮事項

- パターンマッチング用入力検証
- 抽出データのサニタイゼーション
- フォーマット検出リクエストのレート制限
- 悪意のあるパターン注入の防止

### パフォーマンス最適化

- より高速処理のための並列フォーマット検出
- 検出結果のキャッシュ
- ユーザー履歴に基づくスマートフォーマット優先順位付け
- フォーマットハンドラーの遅延読み込み
- メモリ効率的パターンマッチング

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] 主要レシートフォーマットが正確に検出される
- [ ] フォーマット固有抽出パターンが正しく動作する
- [ ] 検証ルールが不正データを適切にフィルタリング
- [ ] フォールバック処理が未知フォーマットを処理する
- [ ] 信頼度スコアリングが精度向上に貢献する
- [ ] 新フォーマット追加が容易である
- [ ] パフォーマンスが許容範囲内である

## 依存関係

- **必須**: PBI-4-2-1 - 画像前処理パイプライン
- **必須**: PBI-4-2-2 - OCRパラメータ最適化

## テスト要件

- Unit Tests (Vitest): パターンマッチング、フォーマット検出、検証ロジック
- Integration Tests (Testing Library): 完全な抽出ワークフロー
- Performance Tests: 大量レシート処理でのスピードベンチマーク
- Accuracy Tests: 各フォーマットの抽出精度測定

### テストカバレッジ要件

- パターンマッチング: 100%
- フォーマット検出: 95%
- 検証ロジック: 100%
- エラー処理: 90%

## 見積もり

2 ストーリーポイント

## 優先度

高 - 一般的レシートタイプの精度を大幅改善

## 実装ノート

- 実際のレシートサンプルでパターンをテストし改良
- フォーマット検出の偽陽性を最小化
- 地域固有のフォーマットバリエーションを考慮
- 新しいベンダーフォーマット追加の容易性を確保
- パターンマッチングのデバッグ用包括的ログを実装
