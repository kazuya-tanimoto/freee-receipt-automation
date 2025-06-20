# Supabaseトラブルシューティングガイド

このガイドでは、freee領収書自動化システムでSupabaseを使用する際の一般的な問題について説明します。

## 接続の問題

### エラー: "Invalid API key"

**症状**:

- アプリケーションがSupabaseに接続できない
- コンソールエラー: `AuthInvalidApiKeyError`

**原因と解決策**:

1. **間違ったAPIキー**

   ```bash
   # .env.localファイルを確認
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here  # anonキーである必要があります
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # service_roleキーである必要があります
   ```

2. **間違ったプロジェクトのAPIキー**

   - 正しいSupabaseプロジェクトのキーを使用しているか確認
   - SupabaseダッシュボードのProject Settings → APIで確認

3. **環境ファイルが読み込まれていない**

   ```bash
   # .env.localがプロジェクトルートに存在するか確認
   ls -la .env.local

   # 開発サーバーを再起動
   npm run dev
   ```

### エラー: "Failed to fetch"

**症状**:

- Supabaseへのネットワークリクエストが失敗
- ブラウザコンソールにCORSエラー

**解決策**:

1. **プロジェクトURLを確認**

   ```bash
   # .env.localのURL形式を確認
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```

2. **ファイアウォール/プロキシの問題**
   - 別のネットワークから接続を試す
   - 企業ファイアウォールの設定を確認
   - モバイルホットスポットでテスト

## 認証の問題

### エラー: 有効な認証情報でも "User not found"

**症状**:

- 正しいメール/パスワードでログインが失敗
- 登録後にユーザーがサインインできない

**解決策**:

1. **メール確認が必要**

   ```typescript
   // メール確認が有効か確認
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password',
   });
   // サインイン前にメール確認が必要
   ```

2. **認証設定を確認**
   - SupabaseダッシュボードのAuthentication → Settingsに移動
   - "Enable email confirmations"設定を確認
   - 確認メールがスパムフォルダに入っていないか確認

### エラー: "Session expired"

**症状**:

- ユーザーが予期せずログアウトされる
- API呼び出しが認証エラーで失敗

**解決策**:

1. **トークンリフレッシュ設定**

   ```typescript
   // 自動トークンリフレッシュが有効か確認
   const supabase = createClient(url, key, {
     auth: {
       autoRefreshToken: true,
       persistSession: true,
     },
   });
   ```

2. **セッション永続性を確認**

   ```typescript
   // セッションが保存されているか確認
   const {
     data: { session },
   } = await supabase.auth.getSession();
   console.log('Current session:', session);
   ```

## データベースの問題

### エラー: "relation does not exist"

**症状**:

- テーブルが見つからないというエラーでクエリが失敗
- 新規インストールでデータベースにアクセスできない

**解決策**:

1. **マイグレーションを実行**

   ```sql
   -- SupabaseのSQL Editorで順番に実行:
   -- 1. supabase/migrations/001_core_tables.sql
   -- 2. supabase/migrations/002_transaction_tables.sql
   -- 3. supabase/migrations/003_rls_policies.sql
   ```

2. **スキーマを確認**

   ```sql
   -- テーブルが存在するか確認
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

### エラー: "Permission denied for table"

**症状**:

- RLSポリシーが正当なユーザーアクセスをブロック
- サービスロール操作が失敗

**解決策**:

1. **RLSポリシーを確認**

   ```sql
   -- 現在のポリシーを表示
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

2. **ユーザーコンテキストをデバッグ**

   ```typescript
   // アプリケーションの現在のユーザーを確認
   const {
     data: { user },
   } = await supabase.auth.getUser();
   console.log('Current user:', user?.id);

   // サービスロールでテスト
   const { data, error } = await supabaseAdmin.from('user_settings').select('*');
   ```

3. **一時的なポリシーバイパス** (開発環境のみ)

   ```sql
   -- 本番環境では絶対に使用しないこと
   ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
   ```

## パフォーマンスの問題

### クエリパフォーマンスが遅い

**症状**:

- APIレスポンスが1秒以上かかる
- データベースクエリがタイムアウト

**解決策**:

1. **不足しているインデックスを追加**

   ```sql
   -- 頻繁にクエリされるカラムにインデックスが不足していないか確認
   CREATE INDEX idx_receipts_user_id ON receipts(user_id);
   CREATE INDEX idx_receipts_status ON receipts(status);
   CREATE INDEX idx_receipts_created_at ON receipts(created_at);
   ```

2. **クエリを最適化**

   ```typescript
   // select()で返すカラムを制限
   const { data } = await supabase
     .from('receipts')
     .select('id, file_name, status') // 不要なカラムを選択しない
     .eq('user_id', userId)
     .limit(10);
   ```

### 高いAPI使用量

**症状**:

- 無料枠の制限に近づいている
- 予期しない課金

**解決策**:

1. **キャッシュを実装**

   ```typescript
   // ユーザー設定をキャッシュ
   const cachedSettings = localStorage.getItem('userSettings');
   if (!cachedSettings) {
     const { data } = await supabase.from('user_settings').select('*').single();
     localStorage.setItem('userSettings', JSON.stringify(data));
   }
   ```

2. **リアルタイムサブスクリプションを効率的に使用**

   ```typescript
   // コンポーネントのアンマウント時にアンサブスクライブ
   useEffect(() => {
     const subscription = supabase
       .channel('receipts')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, payload => console.log(payload))
       .subscribe();

     return () => subscription.unsubscribe();
   }, []);
   ```

## 開発の問題

### TypeScript型エラー

**症状**:

- TypeScriptコンパイルが失敗
- データベースの型定義が不足

**解決策**:

1. **型を再生成**

   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
   ```

2. **型のインポートを更新**

   ```typescript
   import type { Database } from '@/types/supabase';
   type Receipt = Database['public']['Tables']['receipts']['Row'];
   ```

### ローカル開発の同期問題

**症状**:

- ローカルスキーマが本番と異なる
- マイグレーションの競合

**解決策**:

1. **Supabase CLIを使用** (オプション)

   ```bash
   npx supabase db pull  # 本番スキーマをプル
   npx supabase db push  # ローカル変更をプッシュ
   ```

2. **手動スキーマエクスポート**

   ```sql
   -- Supabaseダッシュボードからスキーマをエクスポート
   -- SQL Editor → "..." → Export schema
   ```

## 緊急時の手順

### データベースの完全リセット

#### ⚠️ 警告: これはすべてのデータを削除します

```sql
-- すべてのテーブルを削除 (SupabaseのSQL Editorで実行)
DROP TABLE IF EXISTS processing_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- すべてのマイグレーションを再実行
-- 001_core_tables.sqlを実行
-- 002_transaction_tables.sqlを実行
-- 003_rls_policies.sqlを実行
```

### バックアップとリストア

```bash
# バックアップ (Supabaseダッシュボードから手動エクスポート)
# Settings → Database → Backupに移動

# 重要なデータをリストア
# SQL Editorを使用して必要なレコードを挿入
```

## ヘルプを得る

### ログを確認

1. Supabaseダッシュボード → Logs
2. ブラウザ開発者コンソール
3. API呼び出しの詳細はNetworkタブ

### リソース

- [Supabaseドキュメント](https://supabase.com/docs)
- [Supabase Discordコミュニティ](https://discord.supabase.com)
- [プロジェクトGitHub Issues](https://github.com/your-repo/issues)

### エスカレーション

本番環境に影響する重大な問題の場合：

1. [Supabaseステータスページ](https://status.supabase.com)を確認
2. Supabaseサポートに連絡（有料プラン）
3. 一時的な回避策を検討

---

最終更新日: 2024-06-19
