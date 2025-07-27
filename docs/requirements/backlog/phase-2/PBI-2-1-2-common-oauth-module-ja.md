# PBI-2-1-2: 共通OAuthモジュール

## 説明

複数の外部サービス（Gmail、Google Drive、freee API）の認証フローを処理する再利用可能なOAuth
2.0認証モジュールを作成します。これにより、一貫した認証パターンを提供し、異なるAPI統合間でのコードの重複を削減します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/oauth/index.ts` - メインOAuthモジュールのエクスポート
2. `src/lib/oauth/providers.ts` - OAuthプロバイダー設定
3. `src/lib/oauth/client.ts` - OAuthクライアント実装
4. `src/lib/oauth/token-manager.ts` - トークンストレージとリフレッシュロジック
5. `src/lib/oauth/types.ts` - OAuth関連のTypeScript型
6. `src/lib/oauth/errors.ts` - OAuthエラーハンドリング
7. `docs/auth/oauth-guide.md` - OAuth実装ガイド

### 技術要件

- PKCE付きOAuth 2.0認可コードフローのサポート
- 自動トークンリフレッシュメカニズムの実装
- Supabaseを使用した安全なトークンストレージ
- 複数のOAuthプロバイダー（Google、freee）のサポート
- 包括的なエラーハンドリングを含める

### OAuthプロバイダー設定

```typescript
interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  redirectUri: string;
}

const providers: Record<string, OAuthProvider> = {
  google: {
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/drive.file'],
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
  },
  freee: {
    name: 'freee',
    authUrl: 'https://accounts.secure.freee.co.jp/public_api/authorize',
    tokenUrl: 'https://accounts.secure.freee.co.jp/public_api/token',
    scopes: ['read', 'write'],
    clientId: process.env.FREEE_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/freee`,
  },
};
```

### データベーススキーマの追加

```sql
-- OAuthトークンテーブル
CREATE TABLE public.oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'freee')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);
```

### 従うべきコードパターン

- プロバイダー固有のクライアントにはファクトリーパターンを使用
- トークンマネージャーにはシングルトンパターンを実装
- 型安全性のためにTypeScriptジェネリクスを使用
- トークン処理にはセキュアコーディングプラクティスに従う

### インターフェース仕様

- **入力インターフェース**: PBI-1-1-3からのユーザー認証が必要
- **出力インターフェース**: 外部API統合用のOAuthサービスを提供

  ```typescript
  interface OAuthClient {
    getAuthUrl(state?: string): string;
    exchangeCodeForTokens(code: string, state?: string): Promise<TokenResponse>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;
    revokeToken(token: string): Promise<void>;
  }

  interface TokenManager {
    storeTokens(userId: string, provider: string, tokens: TokenResponse): Promise<void>;
    getValidToken(userId: string, provider: string): Promise<string | null>;
    refreshTokenIfNeeded(userId: string, provider: string): Promise<string | null>;
    revokeTokens(userId: string, provider: string): Promise<void>;
  }

  interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
  }
  ```

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-06-04
- **開始日**: [日付]
- **完了日**: [日付]
- **所有者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]

## 受け入れ基準

- [ ] GoogleとfreeeのOAuthクライアントが実装されている
- [ ] Supabaseからのトークンストレージと取得が正しく動作する
- [ ] 自動トークンリフレッシュが機能する
- [ ] セキュリティのためのPKCEフローが適切に実装されている
- [ ] エラーハンドリングがすべてのOAuth失敗シナリオをカバーしている
- [ ] OAuthトークンテーブルが適切な制約で作成されている

### 検証コマンド

```bash
# OAuthモジュールのコンパイルテスト
npm run type-check
# モックプロバイダーでOAuthフローをテスト
npm run test:oauth
# データベースマイグレーションの検証
npx supabase db reset --local
```

## 依存関係

- **必須**: PBI-1-1-2-A - user_id外部キー用のコアテーブル
- **必須**: PBI-1-1-3 - ユーザーコンテキスト用の認証設定

## テスト要件

- ユニットテスト: OAuthクライアントメソッドとトークン管理をテスト
- 統合テスト: サンドボックス環境でOAuthフローをテスト
- テストデータ: モックOAuthレスポンスとテスト資格情報

## 見積もり

1ストーリーポイント

## 優先度

高 - すべての外部API統合に共通認証が必要

## 実装メモ

- PKCEコード検証器生成にはcrypto.randomUUID()を使用
- データベースストレージ前に適切なトークン暗号化を実装
- OAuthイベントのロギングを追加（トークンを公開しない）
- OAuthステートパラメータの検証実装を検討
- 開発環境で実際のOAuthプロバイダーでテスト
