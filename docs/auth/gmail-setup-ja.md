# Gmail OAuth セットアップガイド

このガイドでは、freee レシート自動化アプリケーション用のGmail OAuth2.0認証の設定と構成方法を説明します。

## 概要

Gmail OAuth統合により、ユーザーは自分のGmailアカウントを安全に接続し、レシートメールを自動処理できます。この実装は、セキュリティ強化のためOAuth 2.0とPKCE（Proof Key for Code Exchange）を使用します。

## 前提条件

### 必要なアカウント

- Google Cloud Platform アカウント
- 有効な Gmail アカウント（テスト用）
- Gmail API へのアクセス権

### 技術要件

- Node.js 18+ がインストール済み
- Supabase プロジェクトが設定済み
- 環境変数の設定権限

## Google Cloud Console セットアップ

### 1. プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. プロジェクト名を記録（例: `freee-receipt-automation`）

### 2. Gmail API 有効化

```bash
# gcloud CLI を使用する場合
gcloud services enable gmail.googleapis.com --project=YOUR_PROJECT_ID

# または Google Cloud Console で：
# 1. APIs & Services > Library に移動
# 2. "Gmail API" を検索
# 3. "Enable" をクリック
```

### 3. OAuth 同意画面設定

1. **APIs & Services > OAuth consent screen** に移動
2. **外部** ユーザータイプを選択（個人使用の場合）
3. 必須フィールドを入力：
   - **アプリ名**: `freee Receipt Automation`
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパー連絡先情報**: あなたのメールアドレス

4. **スコープ** セクション：

   ```text
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/gmail.modify
   ```

5. **テストユーザー** セクション：
   - 開発中に使用するGmailアドレスを追加

### 4. OAuth クライアント作成

1. **APIs & Services > Credentials** に移動
2. **+ CREATE CREDENTIALS > OAuth client ID** をクリック
3. アプリケーションタイプ: **Web application**
4. 設定：

   ```text
   名前: freee Receipt Automation Web Client
   承認済みJavaScript生成元:
   - http://localhost:3000 (開発用)
   - https://your-production-domain.com

   承認済みリダイレクト URI:
   - http://localhost:3000/api/auth/gmail/callback (開発用)
   - https://your-production-domain.com/api/auth/gmail/callback
   ```

5. **作成** をクリック
6. **クライアントID** と **クライアントシークレット** をダウンロード

## 環境変数設定

### .env.local ファイル更新

```bash
# Gmail OAuth 設定
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback

# OAuth フロー用
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Supabase 環境変数

```sql
-- Supabase SQL Editor で実行
INSERT INTO auth.config (key, value) VALUES
('google_client_id', 'your_client_id_here'),
('google_client_secret', 'your_client_secret_here');
```

## アプリケーション統合

### 1. 認証フロー実装

OAuth フローが以下のAPIエンドポイントで実装されています：

- `/api/auth/gmail/authorize` - 認証開始
- `/api/auth/gmail/callback` - コールバック処理

### 2. 認証状態確認

```typescript
// ユーザーの Gmail 認証状態を確認
const { data: authStatus } = await supabase
  .from('user_oauth_tokens')
  .select('*')
  .eq('provider', 'gmail')
  .eq('user_id', userId)
  .single();

if (authStatus && authStatus.access_token) {
  // Gmail API 使用可能
  console.log('Gmail 認証済み');
} else {
  // 認証が必要
  console.log('Gmail 認証が必要');
}
```

### 3. トークン更新

アクセストークンは自動的に更新されますが、手動更新が必要な場合：

```typescript
import { refreshGmailToken } from '@/lib/oauth/gmail';

const newTokens = await refreshGmailToken(refreshToken);
```

## テストとデバッグ

### 1. 認証フローテスト

```bash
# 開発サーバー起動
npm run dev

# ブラウザで認証テスト
open http://localhost:3000/api/auth/gmail/authorize
```

### 2. トークン検証

```bash
# Gmail API トークン検証
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  https://www.googleapis.com/gmail/v1/users/me/profile
```

### 3. ログ確認

```typescript
// 認証ログの確認
const { data: logs } = await supabase
  .from('oauth_logs')
  .select('*')
  .eq('provider', 'gmail')
  .order('created_at', { ascending: false })
  .limit(10);
```

## セキュリティ考慮事項

### 1. トークン保護

- **暗号化**: データベース内のトークンは暗号化されます
- **有効期限**: アクセストークンは1時間で期限切れ
- **スコープ制限**: 必要最小限のGmailスコープのみ要求

### 2. PKCE 実装

```typescript
// PKCE 検証子生成
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// セッションに保存
session.codeVerifier = codeVerifier;
```

### 3. CSRF 保護

- **状態パラメータ**: OAuth フローで状態パラメータを使用
- **セッション検証**: コールバック時にセッション状態を確認

## トラブルシューティング

### よくある問題

1. **"redirect_uri_mismatch" エラー**

   ```text
   解決策: Google Cloud Console でリダイレクトURIを確認・更新
   ```

2. **"access_denied" エラー**

   ```text
   解決策: OAuth 同意画面でアプリが承認されているか確認
   ```

3. **"invalid_grant" エラー**

   ```text
   解決策: 認証コードまたはリフレッシュトークンが期限切れ
   再認証が必要
   ```

### デバッグ手順

1. **ネットワークタブ確認**: ブラウザの開発者ツールでAPI呼び出しを確認
2. **ログ確認**: アプリケーションログでエラー詳細を確認
3. **トークン検証**: Gmail API で直接トークンをテスト

## 運用監視

### 1. メトリクス

- **認証成功率**: 正常な OAuth フロー完了率
- **トークン更新率**: リフレッシュトークンの使用頻度
- **API エラー率**: Gmail API 呼び出しのエラー率

### 2. アラート設定

```typescript
// 認証失敗アラート
if (authFailureRate > 0.1) {
  await sendAlert('Gmail認証失敗率が10%を超えました');
}

// API レート制限アラート
if (apiQuotaUsage > 0.8) {
  await sendAlert('Gmail API使用量が80%を超えました');
}
```

### 3. ダッシュボード

定期的に以下を監視：

1. **Supabase Dashboard**: 認証ログとエラー率
2. **Google Cloud Console**: API使用量クォータ
3. **アプリケーションログ**: OAuth フロー成功/失敗率

## 関連ドキュメント

- [OAuth フロー](../api/oauth-flows.md)
- [認証](../api/authentication.md)
- [エラーハンドリング](../api/error-handling.md)
- [Gmail API 操作](../../docs/requirements/backlog/phase-2/PBI-2-2-2-gmail-basic-api-operations.md)