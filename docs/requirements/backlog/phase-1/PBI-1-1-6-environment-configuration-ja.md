# PBI-1-1-6: 環境設定

## 説明

アプリケーション用の包括的な環境設定管理をセットアップします。これには中央集権的な設定システムの作成、Zodによる検証の実装、デプロイメント固有の設定のセットアップが含まれます。

## 実装詳細

### 作成/修正するファイル

1. `src/config/index.ts` - メイン設定モジュール
2. `src/config/schema.ts` - 設定検証用のZodスキーマ
3. `src/config/env.ts` - 環境変数ローダー
4. `.env.local` - ローカル開発変数（更新）
5. `.env.production` - 本番環境テンプレート
6. `src/lib/validation/env.ts` - ランタイム環境検証

### 技術要件

- スキーマ検証にZodを使用
- 型安全な設定アクセスを実装
- 複数環境（開発、ステージング、本番）をサポート
- 起動時にすべての環境変数を検証
- 欠落/無効な設定に対して明確なエラーメッセージを提供

### 環境変数

```typescript
// 必須変数
NEXT_PUBLIC_SUPABASE_URL: string
NEXT_PUBLIC_SUPABASE_ANON_KEY: string
SUPABASE_SERVICE_ROLE_KEY: string
NEXT_PUBLIC_APP_URL: string
OCR_API_KEY: string
FREEE_CLIENT_ID: string
FREEE_CLIENT_SECRET: string
FREEE_REDIRECT_URI: string

// デフォルト値を持つオプション変数
LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' = 'info'
RATE_LIMIT_MAX_REQUESTS: number = 100
RATE_LIMIT_WINDOW_MS: number = 60000
```

### 従うべきコードパターン

- 設定にはシングルトンパターンを使用
- 機密設定には遅延読み込みを実装
- 型安全性のためにTypeScriptのconst assertionsを使用
- 12ファクターアプリの設定原則に従う

## 受け入れ基準

- [ ] すべての環境変数が起動時に検証される
- [ ] 必須変数の欠落により明確なエラーメッセージが表示される
- [ ] アプリケーション全体で設定が型安全である
- [ ] 異なる環境で正しい設定が読み込まれる
- [ ] 機密データがクライアントサイドコードで露出しない

## 依存関係

- **必須**: PBI-1-1-1 - 基本環境セットアップが存在する必要がある

## テスト要件

- ユニットテスト: 設定検証のテスト
- 統合テスト: 環境読み込みのテスト
- テストデータ: モック環境設定

## 見積もり

1ストーリーポイント

## 優先度

高 - すべての機能に適切な設定が不可欠

## 実装メモ

- process.envは設定モジュールでのみ使用
- パフォーマンスのために設定キャッシングを実装
- シークレット管理にdotenv-vaultの使用を検討
- すべての設定オプションを明確に文書化
