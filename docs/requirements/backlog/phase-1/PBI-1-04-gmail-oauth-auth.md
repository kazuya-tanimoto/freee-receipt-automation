# PBI-1-04: Gmail OAuth認証

## 説明

Gmail APIアクセス用のOAuth 2.0認証フローを実装します。レシート取得に必要な最小限のスコープでGmail APIへの認証を行い、トークン管理を含む基本的な認証機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/gmail-auth.ts` - Gmail OAuth認証処理（80行以内）
2. `pages/api/auth/gmail.ts` - Gmail認証APIエンドポイント（20行以内）

### 技術要件

- Google OAuth 2.0 PKCE フロー
- gmail.readonly スコープのみ
- トークンのセキュアな保存
- リフレッシュトークン対応

### 環境変数

```bash
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
```

### インターフェース仕様

```typescript
interface GmailAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-03完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-03（環境変数設定）完了が前提
- [x] **spec要件確認**: Gmail連携がspec必須要件
- [x] **リソース確認**: Google Cloud Console APIキー設定済み

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 認証処理80行以内
- **単一責任**: Gmail認証のみ、メール取得は含まない
- **直接実装**: 認証ライブラリの複雑な機能は使用しない

### コード品質基準
- **TypeScript**: 型安全な認証フロー
- **エラーハンドリング**: 認証失敗時の明確なエラー
- **JSDoc**: OAuth関数の説明記載

## 受け入れ基準

- [ ] Gmail OAuth認証フローが正常に動作する
- [ ] アクセストークンが正しく取得される
- [ ] トークンの有効期限管理ができる
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
npx tsc --noEmit

# 認証テスト
npm run dev
# /api/auth/gmail にアクセスして認証フロー確認
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: Gmail OAuth認証が完了している
- [ ] **シンプル化**: 必要最小限の認証機能のみ
- [ ] **テスト**: 認証フローテストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 認証コードが理解しやすい
- [ ] **保守性**: トークン管理が適切に設計されている
- [ ] **セキュリティ**: OAuth フローが安全に実装されている
- [ ] **パフォーマンス**: 不要な認証処理がない

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 認証フローテストパス / ❌ X失敗  
- ドキュメント: ✅ OAuth設定説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: Gmailレシート取得への認証基盤が確立された
- **主要な実装**: Gmail OAuth 2.0認証フローとトークン管理
- **残課題**: なし
- **次PBIへの引き継ぎ**: Gmail APIアクセス用認証が他PBIで使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]