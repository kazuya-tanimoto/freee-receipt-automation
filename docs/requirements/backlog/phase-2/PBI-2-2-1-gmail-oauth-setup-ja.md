# PBI-2-2-1: Gmail OAuth設定

## 説明

共通OAuthモジュールを使用してGmail API OAuth
2.0認証を構成します。これにより、適切なスコープと権限を持つメール領収書を読み取るためのGmail
APIへの安全なアクセスを確立します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/gmail/auth.ts` - Gmail固有のOAuth設定
2. `src/lib/gmail/client.ts` - Gmail APIクライアントファクトリー
3. `src/pages/api/auth/gmail/authorize.ts` - OAuth認可エンドポイント
4. `src/pages/api/auth/gmail/callback.ts` - OAuthコールバックハンドラー
5. `src/components/auth/GmailConnect.tsx` - Gmail接続UIコンポーネント
6. `docs/auth/gmail-setup.md` - Gmail APIセットアップガイド

### 技術要件

- PKCEフロー付きGoogle OAuth 2.0を使用
- メール読み取りに必要な最小限のスコープをリクエスト
- 共通OAuthモジュール経由で安全なトークンストレージを実装
- OAuthエラーとエッジケースを処理
- 長期間アクセス用のトークンリフレッシュをサポート

### Gmail固有のOAuth設定

```typescript
import { OAuthClient } from '@/lib/oauth';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata',
];

export class GmailOAuthClient extends OAuthClient {
  constructor() {
    super('google', {
      scopes: GMAIL_SCOPES,
      additionalParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });
  }

  async getGmailClient(userId: string): Promise<gmail_v1.Gmail | null> {
    const token = await this.tokenManager.getValidToken(userId, 'google');
    if (!token) return null;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    return google.gmail({ version: 'v1', auth });
  }
}
```

### APIエンドポイント

```typescript
// POST /api/auth/gmail/authorize
interface AuthorizeRequest {
  userId: string;
}

interface AuthorizeResponse {
  authUrl: string;
  state: string;
}

// GET /api/auth/gmail/callback?code=...&state=...
interface CallbackResponse {
  success: boolean;
  error?: string;
  redirectUrl: string;
}
```

### 環境変数

```bash
# Google OAuth設定
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
```

### 従うべきコードパターン

- 一貫した認証のために共通OAuthモジュールを使用
- OAuth失敗に対する適切なエラー境界を実装
- OAuthイベントの包括的なロギングを追加
- GoogleのOAuth 2.0ベストプラクティスに従う

### インターフェース仕様

- **入力インターフェース**: PBI-2-2-2からの共通OAuthモジュールを使用
- **出力インターフェース**: 他のPBIにGmail APIアクセスを提供

  ```typescript
  export interface GmailAuthService {
    initiateAuth(userId: string): Promise<{ authUrl: string; state: string }>;
    handleCallback(code: string, state: string): Promise<void>;
    getAuthenticatedClient(userId: string): Promise<gmail_v1.Gmail | null>;
    isAuthenticated(userId: string): Promise<boolean>;
    revokeAccess(userId: string): Promise<void>;
  }

  export interface GmailTokenInfo {
    hasAccess: boolean;
    expiresAt?: Date;
    scopes: string[];
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

- [ ] Gmail OAuthフローがUIから正しく開始される
- [ ] OAuthコールバックが共通モジュールを使用してトークンを適切に保存する
- [ ] 有効なトークンでGmail APIクライアントを作成できる
- [ ] トークンの有効期限が切れた時に自動的にトークンリフレッシュが機能する
- [ ] OAuthエラーがユーザーフィードバックと共に適切に処理される
- [ ] Gmail接続ステータスがユーザーインターフェースに表示される

### 検証コマンド

```bash
# Gmail OAuthエンドポイントのテスト
npm run test:integration -- --grep "Gmail OAuth"
# トークンストレージの確認
npm run test:oauth -- gmail
# Gmail APIクライアント作成の検証
npm run dev && curl http://localhost:3000/api/auth/gmail/status
```

## 依存関係

- **必須**: PBI-2-1-2 - 共通OAuthモジュールが実装されている必要がある
- **必須**: PBI-1-1-3 - userIdコンテキスト用のユーザー認証

## テスト要件

- ユニットテスト: Gmail OAuthクライアントメソッドをテスト
- 統合テスト: Google OAuthプレイグラウンドでOAuthフローをテスト
- テストデータ: モックGmail OAuthレスポンス

## 見積もり

1ストーリーポイント

## 優先度

高 - メール処理前にGmail認証が必要

## 実装メモ

- Gmail APIクライアント用にgoogleapis npmパッケージを使用
- まずGoogle OAuth 2.0プレイグラウンドでOAuthフローをテスト
- 最小限の権限を確保するための適切なスコープ検証を実装
- 一般的なOAuth失敗に対するユーザーフレンドリーなエラーメッセージを追加
- 追加スコープの増分認可の実装を検討
