# API エラーハンドリングガイドライン

このドキュメントでは、GmailとGoogle Drive API統合における包括的なエラーハンドリング戦略について説明します。

## エラーレスポンス形式

すべてのAPIエラーは、一貫性とデバッグの容易さのために標準化されたJSON形式に従います。

### 標準エラースキーマ

```json
{
  "error": "error_code",
  "message": "人が読めるエラーの説明",
  "details": {
    "field": "field_name",
    "code": "validation_code",
    "retryAfter": 60
  },
  "timestamp": "2024-06-20T12:00:00.000Z",
  "path": "/api/gmail/messages",
  "requestId": "req_123456789"
}
```

### エラープロパティ

| プロパティ  | 型     | 必須 | 説明                                 |
| ----------- | ------ | ---- | ------------------------------------ |
| `error`     | string | ✅   | 機械読み取り可能なエラーコード       |
| `message`   | string | ✅   | 人が読めるエラーの説明               |
| `details`   | object | ❌   | エラー固有の追加情報                 |
| `timestamp` | string | ✅   | ISO 8601エラータイムスタンプ         |
| `path`      | string | ✅   | エラーを生成したAPIエンドポイント    |
| `requestId` | string | ✅   | リクエストトレーシング用の一意識別子 |

## HTTPステータスコード

### 4xx クライアントエラー

#### 400 Bad Request

無効なリクエストパラメータまたは不正な形式のリクエストボディ。

**一般的なシナリオ**:

- 必須パラメータの不足
- 無効なパラメータ値
- 不正な形式のJSONボディ
- 無効な日付形式

#### 401 Unauthorized

認証が必要または無効な認証情報。

**一般的なシナリオ**:

- アクセストークンの不足
- 期限切れのアクセストークン
- 無効なアクセストークン
- 不十分なトークンスコープ

#### 403 Forbidden

有効な認証だが権限不足。

**一般的なシナリオ**:

- 必要なOAuthスコープの不足
- API アクセス無効
- リソースアクセス拒否
- クォータ超過

#### 404 Not Found

要求されたリソースが存在しない。

**一般的なシナリオ**:

- 無効なメッセージID
- 削除されたファイル
- 存在しない添付ファイル
- 無効なエンドポイント

#### 429 Too Many Requests

レート制限の超過。

**一般的なシナリオ**:

- APIクォータの超過
- 1秒あたりのリクエスト数過多
- ユーザー固有のレート制限に到達

### 5xx サーバーエラー

#### 500 Internal Server Error

予期しないサーバーサイドエラー。

#### 502 Bad Gateway

外部サービスエラー（Google APIs）。

#### 503 Service Unavailable

サービス一時的に利用不可。

## エラーコードカテゴリ

### 認証エラー (AUTH\_\*)

| コード                    | HTTPステータス | 説明                       |
| ------------------------- | -------------- | -------------------------- |
| `AUTH_REQUIRED`           | 401            | 認証が必要                 |
| `AUTH_INVALID`            | 401            | 無効な認証情報             |
| `AUTH_EXPIRED`            | 401            | 認証トークンの期限切れ     |
| `AUTH_INSUFFICIENT_SCOPE` | 403            | トークンに必要な権限が不足 |

### バリデーションエラー (VALIDATION\_\*)

| コード                      | HTTPステータス | 説明                         |
| --------------------------- | -------------- | ---------------------------- |
| `VALIDATION_FAILED`         | 400            | リクエストバリデーション失敗 |
| `VALIDATION_MISSING_FIELD`  | 400            | 必須フィールドの不足         |
| `VALIDATION_INVALID_FORMAT` | 400            | フィールド形式が無効         |
| `VALIDATION_OUT_OF_RANGE`   | 400            | 値が許可範囲外               |

### リソースエラー (RESOURCE\_\*)

| コード               | HTTPステータス | 説明                             |
| -------------------- | -------------- | -------------------------------- |
| `RESOURCE_NOT_FOUND` | 404            | 要求されたリソースが見つからない |
| `RESOURCE_CONFLICT`  | 409            | リソース状態の競合               |
| `RESOURCE_LOCKED`    | 423            | リソースが一時的にロック中       |

### レート制限エラー (RATE\_\*)

| コード                  | HTTPステータス | 説明                   |
| ----------------------- | -------------- | ---------------------- |
| `RATE_LIMIT_EXCEEDED`   | 429            | レート制限超過         |
| `RATE_QUOTA_EXCEEDED`   | 429            | 日次クォータ超過       |
| `RATE_CONCURRENT_LIMIT` | 429            | 同時リクエスト制限超過 |

### 外部サービスエラー (EXTERNAL\_\*)

| コード                         | HTTPステータス | 説明                     |
| ------------------------------ | -------------- | ------------------------ |
| `EXTERNAL_SERVICE_ERROR`       | 502            | 外部サービスエラー       |
| `EXTERNAL_SERVICE_TIMEOUT`     | 504            | 外部サービスタイムアウト |
| `EXTERNAL_SERVICE_UNAVAILABLE` | 503            | 外部サービス利用不可     |

## クライアントサイドエラーハンドリング

### リトライ戦略

リトライ可能なエラーに対する指数バックオフの実装：

```typescript
const RETRYABLE_ERRORS = ['RATE_LIMIT_EXCEEDED', 'EXTERNAL_SERVICE_TIMEOUT', 'EXTERNAL_SERVICE_UNAVAILABLE'];

async function withRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### エラー回復パターン

#### 401でのトークンリフレッシュ

```typescript
async function apiCall(endpoint: string, options: RequestInit) {
  try {
    return await fetch(endpoint, options);
  } catch (error) {
    if (error.status === 401 && error.error === 'AUTH_EXPIRED') {
      await refreshToken();
      return fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }
    throw error;
  }
}
```

## エラー監視とアラート

### 監視すべき主要メトリクス

1. **ステータスコード別エラー率** - 4xxと5xxエラーの比率
2. **認証エラー** - トークン期限切れ頻度
3. **レート制限** - クォータ使用率
4. **外部サービスエラー** - Gmail/Drive API可用性

### アラート閾値

| メトリクス           | 警告           | 重大           |
| -------------------- | -------------- | -------------- |
| エラー率             | > 5%           | > 10%          |
| 認証失敗             | > 10件/時間    | > 50件/時間    |
| レート制限           | > 80% クォータ | > 95% クォータ |
| サービスタイムアウト | > 2%           | > 5%           |

## ベストプラクティス

### 1. 一貫したエラー形式

- 全エンドポイントで標準化されたエラースキーマを使用
- トレーシング用のリクエストIDを含める
- 実行可能なエラーメッセージを提供

### 2. 適切なHTTPステータスコード

- 異なるエラータイプに正しいステータスコードを使用
- エラーレスポンスに200を返さない
- ヘッダーにリトライガイダンスを含める

### 3. セキュリティ考慮事項

- エラーメッセージで機密情報を露出しない
- セキュリティ関連エラーを別途ログ記録
- 悪用防止のためエラーエンドポイントをレート制限

### 4. ユーザーエクスペリエンス

- ユーザー向けに明確で技術的でないエラーメッセージを提供
- 可能な場合は推奨アクションを含める
- 段階的エラー開示を実装

### 5. 観測可能性

- サービス境界を越えた相関IDを含める
- デバッグに十分なコンテキストでエラーをログ記録
- システムヘルスの洞察のためエラーパターンを監視

## 関連ドキュメント

- [エラーハンドリング例](./error-handling-examples.md) - 詳細な例とテストケース
- [OAuth フロー](./oauth-flows-ja.md) - 認証エラーシナリオ
