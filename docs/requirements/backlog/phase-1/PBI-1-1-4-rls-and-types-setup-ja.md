# PBI-1-1-4: RLSと型のセットアップ

## 説明

すべてのデータベーステーブルに対して行レベルセキュリティ（RLS）ポリシーを設定し、freeeレシート自動化システム用のTypeScript型を生成します。これによりユーザー間のデータ分離を確保し、型安全なデータベース操作を提供します。

## 実装詳細

### 作成/修正するファイル

1. `supabase/migrations/003_rls_policies.sql` - 行レベルセキュリティポリシー
2. `src/types/database/index.ts` - 結合されたTypeScript型のエクスポート
3. `src/lib/database/policies.ts` - RLSポリシーヘルパー
4. `docs/database/security.md` - セキュリティポリシードキュメント

### 技術要件

- すべてのユーザーデータテーブルでRLSを有効化
- INSERT、SELECT、UPDATE、DELETE操作用のポリシーを作成
- Supabase CLIを使用してTypeScript型を生成
- 一般的な操作用のポリシーヘルパー関数を実装
- 異なるユーザーシナリオですべてのポリシーをテスト

### RLSポリシー

```sql
-- すべてのテーブルでRLSを有効化
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- ユーザー設定ポリシー
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

-- レシートポリシー
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);

-- 取引ポリシー
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 処理ログポリシー
CREATE POLICY "Users can view own logs" ON public.processing_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.processing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### TypeScript型生成

```bash
# データベーススキーマから型を生成
npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database/supabase.ts
```

### 従うべきコードパターン

- ポリシーでのユーザー識別にはauth.uid()を使用
- 必要に応じてFORとWITH CHECK句の両方を実装
- index.tsから結合された型をエクスポート
- 複雑なポリシーロジックにはヘルパー関数を使用

### インターフェース仕様

- **入力インターフェース**: PBI-1-1-2とPBI-1-1-3からのテーブルが必要
- **出力インターフェース**: 安全なデータベースアクセスパターンを提供

  ```typescript
  // すべてのデータベース型をエクスポート
  export type { Database } from './supabase';
  export type { UserSettings, Receipt, Transaction, ProcessingLog } from './supabase';

  // 一般的な操作用のヘルパー型
  export type DatabaseInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];

  export type DatabaseUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
  ```

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-06-04
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]

## 受け入れ基準

- [ ] すべてのユーザーデータテーブルでRLSが有効化されている
- [ ] すべてのCRUD操作がポリシーによって適切に保護されている
- [ ] TypeScript型が生成され最新である
- [ ] ポリシーヘルパー関数が実装されている
- [ ] セキュリティドキュメントが完成している
- [ ] すべてのポリシーが異なるユーザーシナリオでテストされている

### 検証コマンド

```bash
# RLSポリシーのテスト
npm run test:rls
# 型の生成と検証
npx supabase gen types typescript --check
# セキュリティ監査の実行
npm run audit:security
```

## 依存関係

- **必須**: PBI-1-1-2 - コアテーブルが存在する必要がある
- **必須**: PBI-1-1-3 - 取引テーブルが存在する必要がある

## テスト要件

- ユニットテスト: ポリシーヘルパー関数のテスト
- 統合テスト: 複数ユーザーでのRLS強制のテスト
- テストデータ: 異なるアクセスシナリオを持つサンプルユーザー

## 見積もり

1ストーリーポイント

## 優先度

高 - ユーザーデータ操作の前にセキュリティポリシーが必要

## 実装メモ

- 異なるユーザーコンテキストでRLSポリシーを徹底的にテスト
- CIでTypeScript型が自動的に再生成されることを確認
- 将来のメンテナンスのためにカスタムポリシーロジックを文書化
- 管理操作用のサービスロールバイパスポリシーを検討
