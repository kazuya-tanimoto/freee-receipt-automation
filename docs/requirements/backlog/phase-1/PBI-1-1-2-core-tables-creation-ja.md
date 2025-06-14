# PBI-1-1-2: コアテーブル作成

## 説明

PostgreSQLデータベースにユーザー設定とレシート用のコアデータベーステーブルを作成します。
これにはuser_settingsテーブル（Supabase authの拡張）と、
レシート情報とOCRデータを保存するreceiptsテーブルが含まれます。

## 実装詳細

### 作成/修正するファイル

1. `supabase/migrations/001_core_tables.sql` - コアテーブル作成
2. `src/types/database/core.ts` - コアテーブル用のTypeScript型
3. `docs/database/core-schema.md` - コアテーブルドキュメント

### 技術要件

- PostgreSQL 14+の機能を使用
- プライマリキー用にUUID拡張を有効化
- パフォーマンスのための適切なインデックスをセットアップ
- 適切な外部キー制約を使用
- 監査フィールドを含める（created_at、updated_at）

### データベーススキーマ

```sql
-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザーテーブル（Supabase auth.usersを拡張）
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  freee_company_id TEXT,
  notification_email TEXT,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レシートテーブル
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  ocr_text TEXT,
  ocr_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- パフォーマンスのためのインデックス
CREATE INDEX idx_user_settings_freee_company ON user_settings(freee_company_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);

-- updated_atトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーを適用
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 従うべきコードパターン

- すべてのプライマリキーにUUIDを使用
- 適切なCASCADE削除動作を含める
- enum型フィールドにCHECK制約を使用
- 監査証跡のためにupdated_atトリガーを実装

### インターフェース仕様

- **出力インターフェース**: 他のPBIで利用可能なテーブル

  ```typescript
  interface UserSettings {
    id: string;
    freee_company_id: string | null;
    notification_email: string | null;
    notification_preferences: Record<string, any>;
    created_at: string;
    updated_at: string;
  }

  interface Receipt {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    ocr_text: string | null;
    ocr_data: Record<string, any> | null;
    processed_at: string | null;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
    updated_at: string;
  }
  ```

## 受け入れ基準

- [ ] user_settingsテーブルがauth.usersへの適切な外部キーで作成されている
- [ ] receiptsテーブルがすべての必須フィールドで作成されている
- [ ] すべてのテーブルがパフォーマンスのための適切なインデックスを持っている
- [ ] statusフィールドのCHECK制約が機能している
- [ ] updated_atトリガーが正しく機能している
- [ ] TypeScript型がデータベーススキーマと正確に一致している

## 依存関係

- **必須**: PBI-1-1-1 - Supabaseプロジェクトが初期化されている必要がある

### PBI-1-1-1からの申し送り事項

#### 重要なセキュリティ要件

- [ ] **RLS実装**: 新しいテーブルはすべてRow Level Securityを有効化し、デフォルトDENYポリシーを設定する必要がある
- [ ] **Service Role Key保護**: SUPABASE_SERVICE_ROLE_KEYを絶対にクライアントサイドで使用してはいけない
- [ ] **マイグレーションテンプレート**: 将来の開発のためにRLS対応マイグレーションテンプレートを作成する

#### インフラストラクチャセットアップ要件

- [ ] **依存関係インストール**: @supabase/supabase-jsと必要なNode.jsパッケージをインストール
- [ ] **サーバークライアント分離**: サーバーサイド操作のため`src/lib/supabase/server-client.ts`を作成
- [ ] **型生成**: 自動型生成のため`npm run supabase:types`スクリプトを追加
- [ ] **接続テスト**: `test-supabase-connection.js` → `scripts/test-connection.ts`（TypeScript）に移動

#### 品質保証セットアップ

- [ ] **RLS検証**: 自動RLSチェックスクリプトを作成
- [ ] **PRテンプレート**: RLS検証チェックリストを含むプルリクエストテンプレートを更新
- [ ] **セキュリティドキュメント**: RLSポリシーとセキュリティパターンを文書化

## テスト要件

- ユニットテスト: TypeScript型のコンパイルをテスト
- 統合テスト: テーブル作成と基本的なCRUD操作をテスト
- テストデータ: サンプルユーザー設定とレシートレコード

## 見積もり

1ストーリーポイント

## 優先度

高 - すべてのレシート処理機能に必要なコアテーブル

## 実装メモ

- バージョン管理のためにSupabaseマイグレーションシステムを使用
- サンプルデータで外部キー制約をテスト
- タイムスタンプの適切なタイムゾーン処理を確保
- スキーマドキュメントでフィールドの目的を文書化
