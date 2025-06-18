# PBI-2-3-1: Google Drive OAuth設定

## 説明

共通OAuthモジュールを使用してGoogle Drive API OAuth
2.0認証を構成します。これにより、適切なスコープと権限を持つファイルストレージと整理のためのGoogle Drive
APIへの安全なアクセスを確立します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/drive/auth.ts` - Drive固有のOAuth設定
2. `src/lib/drive/client.ts` - Drive APIクライアントファクトリー
3. `src/pages/api/auth/drive/authorize.ts` - OAuth認可エンドポイント
4. `src/pages/api/auth/drive/callback.ts` - OAuthコールバックハンドラー
5. `src/components/auth/DriveConnect.tsx` - Drive接続UIコンポーネント
6. `docs/auth/drive-setup.md` - Google Drive APIセットアップガイド

### 技術要件

- PKCEフロー付きGoogle OAuth 2.0を使用
- ファイル管理に必要な最小限のスコープをリクエスト
- 共通OAuthモジュール経由で安全なトークンストレージを実装
- OAuthエラーとエッジケースを処理
- 長期間アクセス用のトークンリフレッシュをサポート

### Drive固有のOAuth設定

```typescript
import { OAuthClient } from '@/lib/oauth';

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export class DriveOAuthClient extends OAuthClient {
  constructor() {
    super('google', {
      scopes: DRIVE_SCOPES,
      additionalParams: {
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
      },
    });
  }

  async getDriveClient(userId: string): Promise<drive_v3.Drive | null> {
    const token = await this.tokenManager.getValidToken(userId, 'google');
    if (!token) return null;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    return google.drive({ version: 'v3', auth });
  }

  async hasRequiredScopes(userId: string): Promise<boolean> {
    const tokenInfo = await this.tokenManager.getTokenInfo(userId, 'google');
    if (!tokenInfo?.scopes) return false;

    return DRIVE_SCOPES.every(scope => tokenInfo.scopes.includes(scope));
  }
}
```

### APIエンドポイント

```typescript
// POST /api/auth/drive/authorize
interface DriveAuthorizeRequest {
  userId: string;
  requestedScopes?: string[];
}

interface DriveAuthorizeResponse {
  authUrl: string;
  state: string;
  scopesRequested: string[];
}

// GET /api/auth/drive/callback?code=...&state=...
interface DriveCallbackResponse {
  success: boolean;
  error?: string;
  grantedScopes: string[];
  redirectUrl: string;
}

// GET /api/auth/drive/status
interface DriveStatusResponse {
  isConnected: boolean;
  scopes: string[];
  expiresAt?: string;
  quotaInfo?: {
    limit: string;
    usage: string;
    usageInDrive: string;
  };
}
```

### Driveフォルダー構造設定

```typescript
export interface FolderStructure {
  receipts: {
    path: '/01.領収書';
    monthly: boolean; // MM/サブフォルダーを作成
  };
  fixedAssets: {
    path: '/99.固定資産分';
    monthly: false;
  };
}

export class DriveFolderManager {
  constructor(private driveClient: drive_v3.Drive) {}

  async ensureFolderStructure(structure: FolderStructure): Promise<Record<string, string>> {
    const folderIds: Record<string, string> = {};

    for (const [key, config] of Object.entries(structure)) {
      const folderId = await this.ensureFolder(config.path);
      folderIds[key] = folderId;

      if (config.monthly) {
        // 月次サブフォルダーを作成 (01/, 02/, ... 12/)
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0');
          await this.ensureFolder(`${monthStr}/`, folderId);
        }
      }
    }

    return folderIds;
  }

  private async ensureFolder(path: string, parentId?: string): Promise<string> {
    // フォルダー作成/検索の実装
  }
}
```

### 環境変数

```bash
# Google OAuth設定（Gmailと共有）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/api/auth/drive/callback

# Drive固有の設定
DRIVE_ROOT_FOLDER_NAME=freee-receipts
DRIVE_FOLDER_STRUCTURE_CONFIG=path/to/folder-config.json
```

### 従うべきコードパターン

- 一貫した認証のために共通OAuthモジュールを使用
- OAuth失敗に対する適切なエラー境界を実装
- OAuthイベントの包括的なロギングを追加
- Drive API用のGoogleのOAuth 2.0ベストプラクティスに従う

### インターフェース仕様

- **入力インターフェース**: PBI-2-1-2からの共通OAuthモジュールを使用
- **出力インターフェース**: 他のPBIにDrive APIアクセスを提供

  ```typescript
  export interface DriveAuthService {
    initiateAuth(userId: string, scopes?: string[]): Promise<{ authUrl: string; state: string }>;
    handleCallback(code: string, state: string): Promise<void>;
    getAuthenticatedClient(userId: string): Promise<drive_v3.Drive | null>;
    isAuthenticated(userId: string): Promise<boolean>;
    hasRequiredScopes(userId: string): Promise<boolean>;
    revokeAccess(userId: string): Promise<void>;
  }

  export interface DriveTokenInfo {
    hasAccess: boolean;
    expiresAt?: Date;
    scopes: string[];
    quotaInfo?: DriveQuotaInfo;
  }

  export interface DriveQuotaInfo {
    limit: string;
    usage: string;
    usageInDrive: string;
    usageInDriveTrash: string;
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

- [ ] Google Drive OAuthフローがUIから正しく開始される
- [ ] OAuthコールバックが共通モジュールを使用してトークンを適切に保存する
- [ ] 有効なトークンでDrive APIクライアントを作成できる
- [ ] トークンの有効期限が切れた時に自動的にトークンリフレッシュが機能する
- [ ] OAuthエラーがユーザーフィードバックと共に適切に処理される
- [ ] Drive接続ステータスとクォータ情報がUIに表示される

### 検証コマンド

```bash
# Drive OAuthエンドポイントのテスト
npm run test:integration -- --grep "Drive OAuth"
# トークンストレージとスコープの確認
npm run test:oauth -- drive
# Drive APIクライアント作成の検証
npm run dev && curl http://localhost:3000/api/auth/drive/status
```

## 依存関係

- **必須**: PBI-2-1-2 - 共通OAuthモジュールが実装されている必要がある
- **必須**: PBI-1-1-3 - userIdコンテキスト用のユーザー認証

## テスト要件

- ユニットテスト: Drive OAuthクライアントメソッドをテスト
- 統合テスト: Google OAuthプレイグラウンドでOAuthフローをテスト
- テストデータ: モックDrive OAuthレスポンス

## 見積もり

1ストーリーポイント

## 優先度

高 - ファイル操作前にDrive認証が必要

## 実装メモ

- Drive APIクライアント用にgoogleapis npmパッケージを使用
- まずGoogle OAuth 2.0プレイグラウンドでOAuthフローをテスト
- 最小限の権限を確保するための適切なスコープ検証を実装
- 一般的なOAuth失敗に対するユーザーフレンドリーなエラーメッセージを追加
- 追加スコープの増分認可の実装を検討
- スコープの組み合わせ（Drive + Gmailスコープ）を慎重に処理
