# PBI-1-05: Gmail メール検索・取得

## 説明

認証済みGmail APIを使用してレシート付きメールを検索・取得します。Apple課金レシートなど特定のメール パターンを検索し、PDF添付ファイルを抽出する機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/gmail-search.ts` - Gmail検索・メール取得（120行以内）

### 技術要件

- Gmail API v1使用
- クエリベースのメール検索
- PDF添付ファイル検出・取得
- レート制限対応

### 環境変数

```bash
# PBI-1-04で設定済みのGmail認証情報を使用
```

### インターフェース仕様

```typescript
interface GmailSearchQuery {
  query: string;
  maxResults?: number;
}

interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: Date;
  attachments: GmailAttachment[];
}

interface GmailAttachment {
  filename: string;
  mimeType: string;
  data: Buffer;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-04完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-04（Gmail認証）完了が前提
- [x] **spec要件確認**: Gmailレシート取得がspec必須要件
- [x] **リソース確認**: Gmail API認証が利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 検索・取得処理120行以内
- **単一責任**: Gmail検索・取得のみ、OCR処理は含まない
- **直接実装**: 複雑な検索フィルタリングは避ける

### コード品質基準
- **TypeScript**: 型安全なAPI応答処理
- **エラーハンドリング**: API エラーの適切な処理
- **JSDoc**: 検索関数の説明記載

## 受け入れ基準

- [ ] Gmailでレシート関連メールが検索できる
- [ ] PDF添付ファイルが正しく取得される
- [ ] API制限に適切に対応している
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# 検索テスト
yarn dev
# Gmail検索APIを呼び出してレスポンス確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-05-gmail-search`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-05-gmail-search`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-05 Gmail email search and retrieval

- Implement Gmail API search functionality
- Add PDF attachment detection and extraction
- Handle rate limiting and error responses
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: Gmail検索・取得が完了している
- [ ] **シンプル化**: 必要最小限の検索機能のみ
- [ ] **テスト**: 検索・取得テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 検索コードが理解しやすい
- [ ] **保守性**: 検索クエリが修正しやすい設計
- [ ] **セキュリティ**: Gmail API使用が安全に実装されている
- [ ] **パフォーマンス**: 適切なレート制限対応

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 検索・取得テストパス / ❌ X失敗  
- ドキュメント: ✅ 検索機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: Gmailからレシート自動取得が可能になった
- **主要な実装**: Gmail検索API活用とPDF添付ファイル取得
- **残課題**: なし
- **次PBIへの引き継ぎ**: 取得したPDFがOCR処理で使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]