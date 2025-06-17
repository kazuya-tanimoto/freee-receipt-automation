# Database Security Documentation

このドキュメントは、freeeレシート自動化システムのデータベースセキュリティ実装について説明します。

## 概要

本システムでは、Supabaseの行レベルセキュリティ（RLS）を使用して、ユーザー間のデータ分離を確保しています。すべてのユーザーデータテーブルにRLSポリシーが適用され、認証されたユーザーが自分のデータのみにアクセスできるようになっています。

## RLS (Row Level Security) ポリシー

### 有効化されているテーブル

以下のテーブルでRLSが有効化されています：

- `user_settings` - ユーザー設定
- `receipts` - レシート情報
- `transactions` - 取引データ
- `processing_logs` - 処理ログ

### ポリシーの概要

#### 1. User Settings テーブル

```sql
-- ユーザーは自分の設定のみ閲覧可能
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

-- ユーザーは自分の設定のみ挿入可能
CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ユーザーは自分の設定のみ更新可能
CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. Receipts テーブル

```sql
-- ユーザーは自分のレシートのみ閲覧可能
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のレシートのみ挿入可能
CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のレシートのみ更新可能
CREATE POLICY "Users can update own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のレシートのみ削除可能
CREATE POLICY "Users can delete own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3. Transactions テーブル

```sql
-- ユーザーは自分の取引のみ閲覧可能
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の取引のみ挿入可能
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の取引のみ更新可能
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
```

#### 4. Processing Logs テーブル

```sql
-- ユーザーは自分のログのみ閲覧可能
CREATE POLICY "Users can view own logs" ON public.processing_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のログのみ挿入可能
CREATE POLICY "Users can insert own logs" ON public.processing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## セキュリティ原則

### 1. 認証の必須化

- すべてのデータベース操作には認証が必要
- `auth.uid()`を使用してユーザーを識別
- 未認証ユーザーはデータにアクセス不可

### 2. データ分離

- ユーザーは自分のデータのみアクセス可能
- 他のユーザーのデータは完全に隔離
- 管理者権限の概念は現在実装していない

### 3. 操作制限

- SELECT: 自分のデータのみ閲覧可能
- INSERT: 自分のuser_idでのみ作成可能
- UPDATE: 自分のデータのみ更新可能
- DELETE: 自分のデータのみ削除可能（レシートテーブルのみ）

## RLSポリシーヘルパー関数

`src/lib/database/policies.ts`にRLS操作を簡単にするヘルパー関数を提供しています。

### 主要な機能

#### 1. ユーザーコンテキストの検証

```typescript
export function validateUserContext(context: RLSContext): void {
  if (!context.is_authenticated) {
    throw new RLSPolicyError('User must be authenticated', context);
  }
  
  if (!context.user_id) {
    throw new RLSPolicyError('User ID is required', context);
  }
}
```

#### 2. セキュアなクライアント作成

```typescript
export function createSecureClient(context: RLSContext) {
  validateUserContext(context);
  return createServerClient();
}
```

#### 3. テーブル固有のポリシーヘルパー

- `userSettingsPolicies` - ユーザー設定操作
- `receiptPolicies` - レシート操作
- `transactionPolicies` - 取引操作
- `processingLogPolicies` - ログ操作

## セキュリティテスト

### テスト戦略

1. **認証テスト**
   - 未認証ユーザーがデータにアクセスできないことを確認
   - 認証されたユーザーが自分のデータにアクセスできることを確認

2. **権限テスト**
   - ユーザーAがユーザーBのデータにアクセスできないことを確認
   - 各CRUD操作で適切なRLSポリシーが適用されることを確認

3. **エラーハンドリングテスト**
   - 不正なアクセス試行で適切なエラーが発生することを確認
   - RLSPolicyErrorが適切にスローされることを確認

### テストコマンド

```bash
# RLSポリシーのテスト
npm run test:rls

# セキュリティ監査の実行
npm run audit:security

# TypeScript型の検証
npx supabase gen types typescript --check
```

## セキュリティ設定

### 環境変数

以下の環境変数が適切に設定されていることを確認してください：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# RLS強制モード（推奨）
SUPABASE_RLS_ENABLED=true
```

### データベース設定

```sql
-- RLS強制モードを有効化
ALTER DATABASE postgres SET row_security = on;

-- SupabaseサービスロールでもRLSを強制
ALTER ROLE service_role SET row_security = on;
```

## 監査とモニタリング

### ログ監視

以下のイベントを監視することを推奨：

1. **認証失敗**
   - 無効なトークンでのアクセス試行
   - 期限切れセッションでのアクセス試行

2. **権限違反**
   - RLSポリシー違反の試行
   - 他ユーザーデータへの不正アクセス試行

3. **異常な操作パターン**
   - 大量のデータアクセス
   - 通常と異なる時間帯でのアクセス

### アラート設定

```sql
-- 権限違反の監視
CREATE OR REPLACE FUNCTION log_rls_violations()
RETURNS trigger AS $$
BEGIN
  -- RLSポリシー違反をログに記録
  INSERT INTO security_logs (event_type, user_id, details, created_at)
  VALUES ('rls_violation', auth.uid(), NEW, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 注意事項とベストプラクティス

### 1. サービスロールの使用

- サービスロールはRLSをバイパスできる
- 管理操作以外ではサービスロールを使用しない
- サービスロールキーの管理を厳重に行う

### 2. クライアントサイドのセキュリティ

- フロントエンドでも適切な権限チェックを実装
- RLSは最後の防御線として機能
- ユーザーインターフェースレベルでのアクセス制御も重要

### 3. エラーハンドリング

- セキュリティ関連のエラーは詳細な情報を露出しない
- ログには詳細を記録するが、ユーザーには一般的なメッセージを表示
- 攻撃者に有用な情報を与えない

### 4. 定期的な監査

- RLSポリシーの定期的な見直し
- セキュリティテストの自動化
- アクセスログの定期的な分析

## 関連ファイル

- [`supabase/migrations/003_rls_policies.sql`](../../supabase/migrations/003_rls_policies.sql) - RLSポリシー定義
- [`src/lib/database/policies.ts`](../../src/lib/database/policies.ts) - ポリシーヘルパー関数
- [`src/types/database/index.ts`](../../src/types/database/index.ts) - TypeScript型定義

## 更新履歴

| 日付 | 変更内容 | 担当者 |
|------|----------|--------|
| 2025-06-17 | 初版作成 | AI Assistant |

## 問い合わせ

セキュリティに関する質問や懸念事項がある場合は、開発チームまでお問い合わせください。
