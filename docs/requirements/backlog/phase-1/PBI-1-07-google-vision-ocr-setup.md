# PBI-1-07: Google Vision API OCRセットアップ

## 説明

Google Vision APIを使用してPDFファイルからテキストを抽出するOCR機能をセットアップします。API認証、基本的なOCR呼び出し、テキスト抽出の最小限の機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/vision-ocr.ts` - Google Vision API OCR処理（80行以内）

### 技術要件

- Google Vision API v1使用
- PDFファイルからテキスト抽出
- API認証とエラーハンドリング
- レート制限対応

### 環境変数

```bash
# PBI-1-03で設定済み
GOOGLE_VISION_API_KEY=your_vision_api_key
```

### インターフェース仕様

```typescript
interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisionOCR {
  extractText(filePath: string): Promise<OCRResult>;
  processDocument(buffer: Buffer): Promise<string>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-06完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-06（PDF抽出）完了が前提
- [x] **spec要件確認**: OCR処理がspec必須要件
- [x] **リソース確認**: Google Vision API設定済み

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: OCR処理80行以内
- **単一責任**: テキスト抽出のみ、データ解析は含まない
- **直接実装**: 複雑な画像前処理は行わない

### コード品質基準
- **TypeScript**: 型安全なAPI応答処理
- **エラーハンドリング**: Vision API エラーの適切な処理
- **JSDoc**: OCR関数の説明記載

## 受け入れ基準

- [ ] PDFファイルからテキストが抽出される
- [ ] Vision API認証が正常に動作する
- [ ] OCR結果が適切な形式で返される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# OCRテスト
yarn dev
# テスト用PDFファイルでOCR処理確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-07-vision-ocr-setup`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-07-vision-ocr-setup`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-07 Google Vision API OCR setup

- Implement Google Vision API integration
- Add PDF text extraction functionality
- Set up OCR processing with error handling
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: OCR機能が完了している
- [ ] **シンプル化**: 必要最小限のOCR機能のみ
- [ ] **テスト**: OCR処理テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: OCR処理コードが理解しやすい
- [ ] **保守性**: API呼び出しが適切に設計されている
- [ ] **セキュリティ**: API キーが安全に管理されている
- [ ] **パフォーマンス**: 効率的なOCR処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ OCR処理テストパス / ❌ X失敗  
- ドキュメント: ✅ OCR機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: PDFレシートからテキスト情報が自動抽出可能になった
- **主要な実装**: Google Vision API活用OCR機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 抽出されたテキストがデータパース処理で使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]