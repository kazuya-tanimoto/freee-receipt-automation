# Environment Configuration Guide

## 概要

本プロジェクトでは、Zodスキーマベースの型安全な環境設定システムを採用しています。このシステムは、セキュリティ、型安全性、開発体験の向上を目的として設計されています。

## 基本的な使用方法

### 設定の読み込み

```typescript
import { serverConfig, clientConfig } from '@/config';

// サーバーサイドでの使用
const supabaseConfig = serverConfig.supabase; // { url, anonKey, serviceRoleKey }
const apiKey = serverConfig.ocr.apiKey;

// クライアントサイドでの使用
const appUrl = clientConfig.app.url;
const supabaseUrl = clientConfig.supabase.url;
```

### バッチ取得

```typescript
// 全設定を一度に取得
const allServerConfig = serverConfig.all;
const allClientConfig = clientConfig.all;
```

## Next.js標準機能との連携

### 環境変数の優先順位

Next.jsの環境変数読み込み順序に準拠しています：

1. **process.env**（システム環境変数）
2. **.env.local**（gitignore対象）
3. **.env.production** / **.env.development**
4. **.env**

### 重要な考慮事項

- **NEXT_PUBLIC_** プレフィックス変数は自動的にクライアントサイドに露出されます
- 本システムでは、NEXT_PUBLIC_変数に機密情報が含まれていないかを自動検証します
- 設定の変更は開発サーバーの再起動が必要です（ホットリロード対象外）

## セキュリティ機能

### 機密情報の自動検出

以下のパターンを持つ環境変数は機密情報として自動検出されます：

**プレフィックス:**

- `SK_*` - Stripe秘密鍵等
- `SECRET_*` - 汎用秘密情報
- `PRIVATE_*` - プライベート情報
- `API_KEY_*` - APIキー
- `TOKEN_*` - アクセストークン

**サフィックス:**

- `*_SECRET` - 秘密情報
- `*_KEY` - キー情報
- `*_TOKEN` - トークン
- `*_PASSWORD` - パスワード
- `*_PRIVATE` - プライベート情報
- `*_CREDENTIALS` - 認証情報

**危険なキーワード:**

- `PASSWORD`, `CREDENTIAL`, `ENCRYPT`

### NEXT_PUBLIC_変数の安全性チェック

```typescript
// ❌ これは自動的に検出されエラーになります
NEXT_PUBLIC_SECRET_KEY=xxx

// ✅ これは正常です
NEXT_PUBLIC_APP_URL=https://example.com
```

## 環境別設定

### 開発環境 (development)

- 詳細なエラーメッセージ表示
- デバッグ情報の出力
- キャッシュクリア機能の利用可能
- デフォルトログレベル: `debug`

### ステージング環境 (staging)

- 限定的なエラー情報
- パフォーマンス統計の表示
- デフォルトログレベル: `info`

### 本番環境 (production)

- 最小限のエラー情報（セキュリティ考慮）
- 汎用的なエラーメッセージ
- デフォルトログレベル: `warn`

## エラーハンドリング

### 開発環境でのエラー表示例

```console
❌ Server environment validation failed:
Missing variables: ['OCR_API_KEY', 'FREEE_CLIENT_SECRET']
Validation errors: {
  OCR_API_KEY: { message: 'OCR API key is required' }
}

📝 Development tips:
1. Check your .env.local file for missing variables
2. Ensure all required environment variables are set
3. Verify URL formats are valid
4. Check API keys are properly configured
```

### 本番環境でのエラー表示例

```console
Environment configuration error in server context
Application configuration error. Please check server logs.
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. 環境変数が読み込まれない

```bash
# Next.js開発サーバーを再起動
npm run dev
```

#### 2. 型エラーが発生する

```typescript
// スキーマを確認し、必要な変数を追加
// src/config/schema.ts を参照
```

#### 3. 機密情報の誤った露出

```bash
# エラーメッセージを確認し、変数名を修正
# NEXT_PUBLIC_プレフィックスを削除または変数名を変更
```

### デバッグ用コマンド

```typescript
import { getEnvironmentInfo } from '@/lib/validation/env';

// 環境情報の確認
console.log(getEnvironmentInfo());
```

## ベストプラクティス

### 1. 環境変数の命名規則

```bash
# ✅ 推奨
DATABASE_URL=postgresql://...
REDIS_PASSWORD=xxx
NEXT_PUBLIC_APP_NAME=MyApp

# ❌ 非推奨
DB_CONN=postgresql://...  # 略語の使用
secret=xxx               # 小文字の使用
NEXT_PUBLIC_DB_PASS=xxx  # 機密情報のクライアント露出
```

### 2. 設定の型安全な使用

```typescript
// ✅ 型安全な方法
const config = serverConfig.supabase;
const url = config.url; // string型が保証される

// ❌ 直接アクセス（型安全性なし）
const url = process.env.SUPABASE_URL; // string | undefined
```

### 3. 本番環境での設定管理

- 環境変数は環境固有のシークレット管理サービスを使用
- .env.productionファイルは参考用のみ（実際の値は含めない）
- CI/CDパイプラインでの環境変数検証を実装

## リファレンス

### 型定義

```typescript
// 完全な環境変数型
type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  // ... 他の変数
};

// クライアント環境変数型
type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: string;
};
```

### 設定構造

```typescript
// サーバー設定の構造
type ServerConfig = {
  supabase: { url: string; anonKey: string; serviceRoleKey: string };
  app: { url: string; nodeEnv: string };
  ocr: { apiKey: string };
  freee: { clientId: string; clientSecret: string; redirectUri: string };
  logging: { level: string };
  rateLimit: { maxRequests: number; windowMs: number };
};
```

## 関連ファイル

- `src/config/schema.ts` - 環境変数スキーマ定義
- `src/config/env.ts` - 環境変数ローダー
- `src/config/index.ts` - メイン設定モジュール
- `src/lib/validation/env.ts` - 実行時検証
- `.env.local` - 開発環境設定
- `.env.production` - 本番環境テンプレート

## 変更履歴

| 日付       | バージョン | 変更内容                                     | 担当者 |
| ---------- | ---------- | -------------------------------------------- | ------ |
| 2025-06-15 | 1.0.0      | 初版作成（PBI-1-1-6実装に伴うガイド作成）   | AI     |
