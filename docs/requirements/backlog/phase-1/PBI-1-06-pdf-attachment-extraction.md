# PBI-1-06: PDF添付ファイル抽出

## 説明

Gmailメールから取得したPDF添付ファイルを処理し、OCR処理用に準備します。Base64デコード、ファイル検証、一時保存を行う最小限の機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/pdf-extractor.ts` - PDF抽出・検証処理（70行以内）

### 技術要件

- Base64 PDF データの処理
- ファイル形式検証
- 一時ファイル保存
- エラーハンドリング

### インターフェース仕様

```typescript
interface PDFExtraction {
  filename: string;
  buffer: Buffer;
  isValid: boolean;
  filePath?: string;
}

interface PDFProcessor {
  extractPDF(attachment: GmailAttachment): Promise<PDFExtraction>;
  validatePDF(buffer: Buffer): boolean;
  saveTempFile(buffer: Buffer, filename: string): Promise<string>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-05完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-05（Gmail取得）完了が前提
- [x] **spec要件確認**: PDF処理がOCR処理に必要
- [x] **リソース確認**: ファイルシステム書き込み権限確認

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: PDF処理70行以内
- **単一責任**: PDF抽出のみ、OCR処理は含まない
- **直接実装**: 複雑なPDF操作ライブラリは使用しない

### コード品質基準
- **TypeScript**: 型安全なファイル処理
- **エラーハンドリング**: ファイル操作エラーの適切な処理
- **JSDoc**: PDF処理関数の説明記載

## 受け入れ基準

- [ ] PDF添付ファイルが正しく抽出される
- [ ] ファイル形式検証が動作する
- [ ] 一時ファイル保存が成功する
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# PDF処理テスト
yarn dev
# テスト用PDFファイルで抽出処理確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-06-pdf-extraction`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-06-pdf-extraction`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-06 PDF attachment extraction

- Implement PDF file extraction from Gmail attachments
- Add file validation and temporary storage
- Handle Base64 decoding and file operations
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: PDF抽出処理が完了している
- [ ] **シンプル化**: 必要最小限の抽出機能のみ
- [ ] **テスト**: PDF処理テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: PDF処理コードが理解しやすい
- [ ] **保守性**: ファイル処理が適切に設計されている
- [ ] **セキュリティ**: ファイル操作が安全に実装されている
- [ ] **パフォーマンス**: 効率的なファイル処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ PDF処理テストパス / ❌ X失敗  
- ドキュメント: ✅ PDF処理説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: PDF添付ファイルがOCR処理用に準備可能になった
- **主要な実装**: PDF抽出・検証・一時保存機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 抽出されたPDFがOCR処理で使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]