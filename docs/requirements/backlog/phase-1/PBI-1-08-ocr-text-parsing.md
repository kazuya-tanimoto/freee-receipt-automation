# PBI-1-08: OCRテキスト解析・パース

## 説明

OCRで抽出されたテキストから金額、日付、店舗名など構造化データを抽出します。正規表現パターンマッチングによる基本的な情報抽出機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/text-parser.ts` - テキスト解析・データ抽出（120行以内）

### 技術要件

- 金額抽出（¥記号、カンマ区切り対応）
- 日付抽出（複数フォーマット対応）
- 店舗名・商品名抽出
- 正規表現パターンマッチング

### インターフェース仕様

```typescript
interface ParsedReceiptData {
  amount?: number;
  date?: Date;
  vendor?: string;
  description?: string;
  rawText: string;
}

interface TextParser {
  parseReceiptText(text: string): ParsedReceiptData;
  extractAmount(text: string): number | null;
  extractDate(text: string): Date | null;
  extractVendor(text: string): string | null;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-07完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-07（OCR機能）完了が前提
- [x] **spec要件確認**: データ抽出がfreee連携に必要
- [x] **リソース確認**: OCR結果テキストが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: テキスト解析120行以内
- **単一責任**: データ抽出のみ、freee連携は含まない
- **直接実装**: 複雑なNLP処理は行わない

### コード品質基準
- **TypeScript**: 型安全なデータ抽出
- **エラーハンドリング**: 抽出失敗時の適切な処理
- **JSDoc**: 解析関数の説明記載

## 受け入れ基準

- [ ] OCRテキストから金額が正しく抽出される
- [ ] 日付情報が適切にパースされる
- [ ] 店舗名・説明が取得される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# パーステスト
yarn dev
# テスト用OCRテキストで解析処理確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-08-ocr-text-parsing`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-08-ocr-text-parsing`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-08 OCR text analysis and parsing

- Implement receipt data extraction from OCR text
- Add pattern matching for amounts, dates, vendors
- Set up structured data parsing functionality
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: テキスト解析機能が完了している
- [ ] **シンプル化**: 必要最小限の解析機能のみ
- [ ] **テスト**: 解析処理テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 解析コードが理解しやすい
- [ ] **保守性**: パターン追加が容易な設計
- [ ] **セキュリティ**: 入力値検証が適切
- [ ] **パフォーマンス**: 効率的なテキスト処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 解析処理テストパス / ❌ X失敗  
- ドキュメント: ✅ 解析機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシートから構造化データが自動抽出可能になった
- **主要な実装**: 正規表現ベースのテキスト解析機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 抽出データがfreee連携で使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]