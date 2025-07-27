# PBI-4-2-4: テキスト後処理パイプライン

## 説明

OCR出力をクリーンアップ、正規化、拡張するための包括的テキスト後処理パイプラインを実装し、エラー修正、フォーマット標準化、信頼度ベーステキスト検証を含みます。

## 実装詳細

### 作成/修正するファイル

1. `src/services/ocr/postprocessing/TextPostprocessor.ts` - メインテキスト後処理サービス
2. `src/services/ocr/postprocessing/normalizers/` - テキスト正規化器
3. `src/services/ocr/postprocessing/correctors/` - エラー修正器
4. `src/lib/text/validation.ts` - テキスト検証ユーティリティ
5. `src/lib/text/formatters.ts` - フォーマット標準化関数
6. `src/config/postprocessing.ts` - 後処理設定
7. `src/services/ocr/postprocessing/pipeline.ts` - 処理パイプライン統括
8. `src/workers/text-processing.worker.ts` - 重いテキスト処理用Web Worker

### 技術要件

- テキスト正規化と標準化
- 辞書とコンテキストを使用したOCRエラー修正
- 通貨と日付フォーマットの標準化
- 信頼度ベーステキストフィルタリングと検証
- 言語固有後処理（英語/日本語）
- 機械学習ベースエラー検出と修正
- リアルタイム処理と批評処理サポート

### テキスト後処理パイプライン

```typescript
interface TextPostprocessor {
  normalizeText(text: string, language: string): Promise<string>;
  correctOCRErrors(text: string, context: string): Promise<string>;
  standardizeFormats(text: string): Promise<StandardizedText>;
  validateConfidence(text: string, confidence: number): Promise<boolean>;
  extractStructuredData(text: string): Promise<StructuredData>;
}

interface StandardizedText {
  normalizedText: string;
  extractedAmounts: CurrencyAmount[];
  extractedDates: Date[];
  extractedVendors: string[];
  confidence: number;
}

interface PostprocessingConfig {
  enableNormalization: boolean;
  enableErrorCorrection: boolean;
  enableFormatStandardization: boolean;
  confidenceThreshold: number;
  language: 'en' | 'ja' | 'auto';
  customDictionary: string[];
}
```

### エラー修正エンジン

```typescript
class OCRErrorCorrector {
  // 一般的なOCRエラーパターンの修正（0→O、1→I等）
  async correctCommonErrors(text: string): Promise<string>;

  // 辞書ベース単語修正
  async correctWithDictionary(text: string, dictionary: string[]): Promise<string>;

  // コンテキストベースエラー修正
  async correctWithContext(text: string, context: ReceiptContext): Promise<string>;

  // 数値とフォーマット修正
  async correctNumbers(text: string): Promise<string>;

  // 日本語固有修正（ひらがな・カタカナ・漢字）
  async correctJapanese(text: string): Promise<string>;
}
```

### フォーマット標準化

```typescript
interface FormatStandardizer {
  // 通貨フォーマット標準化（￥1,000 → 1000 JPY）
  standardizeCurrency(text: string): CurrencyAmount[];

  // 日付フォーマット標準化（2024/01/01 → ISO8601）
  standardizeDates(text: string): Date[];

  // 電話番号フォーマット標準化
  standardizePhoneNumbers(text: string): string[];

  // 住所フォーマット標準化
  standardizeAddresses(text: string): Address[];
}
```

### セキュリティ考慮事項

- テキスト処理中の個人情報保護
- 悪意のある入力に対する堅牢性
- メモリ効率的処理による DoS 攻撃防止
- 処理ログでの機密情報漏洩防止

### パフォーマンス最適化

- 大容量テキスト用Web Worker処理
- 段階的処理と早期終了最適化
- 処理結果のキャッシュとメモ化
- 並列処理用テキストチャンク分割
- メモリ効率的文字列操作

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] テキスト正規化が一貫した出力を生成する
- [ ] OCRエラー修正が精度を向上させる
- [ ] フォーマット標準化が構造化データを生成する
- [ ] 信頼度検証が低品質テキストをフィルタリング
- [ ] 言語固有処理が適切に動作する
- [ ] 処理パフォーマンスが許容範囲内である
- [ ] 構造化データ抽出が正確である

## 依存関係

- **必須**: PBI-4-2-2 - OCRパラメータ最適化
- **必須**: PBI-4-2-3 - レシートフォーマットハンドラー

## テスト要件

- Unit Tests (Vitest): 正規化ロジック、エラー修正、フォーマット標準化
- Integration Tests (Testing Library): 完全な後処理パイプライン
- Performance Tests: 大容量テキスト処理のスピードベンチマーク
- Quality Tests: 処理前後のテキスト品質比較

### テストカバレッジ要件

- 正規化アルゴリズム: 100%
- エラー修正ロジック: 95%
- フォーマット標準化: 100%
- 検証機能: 100%

## 見積もり

2 ストーリーポイント

## 優先度

高 - 信頼性のあるデータ抽出に必須

## 実装ノート

- 実際のOCR出力でエラーパターンをテストし改良
- 言語固有の特殊ケースを考慮した処理を実装
- 処理ステップのデバッグ用詳細ログを追加
- 新しい修正ルール追加の容易性を確保
- 処理品質向上のためのA/Bテストフレームワークを実装
