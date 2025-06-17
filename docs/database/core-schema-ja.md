# コアデータベーススキーマ

## 概要

このドキュメントでは、freee領収書自動化システムのPBI-1-1-2で作成されたコアデータベーステーブルについて説明します。
これらのテーブルは、ユーザー設定管理と領収書処理の基盤となります。

## テーブル

### user_settings

Supabaseの`auth.users`テーブルをアプリケーション固有のユーザー設定で拡張します。

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `id` | UUID | PK, FK auth.users(id) CASCADE | Supabase認証のユーザーID |
| `freee_company_id` | TEXT | NULL | 連携用のfreee会社ID |
| `notification_email` | TEXT | NULL | 通知用メールアドレス |
| `notification_preferences` | JSONB | DEFAULT '{}' | 通知設定JSON |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | レコード作成タイムスタンプ |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 最終更新タイムスタンプ |

**インデックス:**

- `idx_user_settings_freee_company` on `freee_company_id`

**トリガー:**

- `update_user_settings_updated_at` - レコード変更時に`updated_at`を自動更新

**行レベルセキュリティ (RLS):**

- ユーザーは自分の設定レコードのみアクセス可能
- ポリシー: 自分のレコードのみSELECT、INSERT、UPDATE可能

### receipts

領収書ファイルとOCR処理結果を保存します。

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `id` | UUID | PK DEFAULT uuid_generate_v4() | 一意の領収書識別子 |
| `user_id` | UUID | NOT NULL, FK auth.users(id) CASCADE | 領収書の所有者 |
| `file_name` | TEXT | NOT NULL | 元ファイル名 |
| `file_path` | TEXT | NOT NULL | ファイル保存パス |
| `file_size` | INTEGER | NULL | ファイルサイズ（バイト） |
| `mime_type` | TEXT | NULL | MIMEタイプ |
| `ocr_text` | TEXT | NULL | 抽出されたOCRテキスト |
| `ocr_data` | JSONB | NULL | 構造化OCRデータ |
| `processed_at` | TIMESTAMPTZ | NULL | OCR処理完了時刻 |
| `status` | TEXT | DEFAULT 'pending', CHECK IN (...) | 処理ステータス |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | レコード作成タイムスタンプ |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 最終更新タイムスタンプ |

**インデックス:**

- `idx_receipts_user_id` on `user_id`
- `idx_receipts_status` on `status`
- `idx_receipts_created_at` on `created_at`

**トリガー:**

- `update_receipts_updated_at` - レコード変更時に`updated_at`を自動更新

**行レベルセキュリティ (RLS):**

- ユーザーは自分の領収書レコードのみアクセス可能
- ポリシー: 自分のレコードのみSELECT、INSERT、UPDATE、DELETE可能

## データベース関数

### update_updated_at_column()

レコードが変更されたときに`updated_at`カラムを自動的に更新するトリガー関数です。

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## セキュリティ考慮事項

### 行レベルセキュリティ (RLS)

すべてのテーブルでRLSが有効化され、デフォルトDENYポリシーが設定されています。
ユーザーは自分のデータのみにアクセス可能です：

- **user_settings**: ユーザーは自分の設定のみ表示、挿入、更新可能
- **receipts**: ユーザーは自分の領収書のみ表示、挿入、更新、削除可能

### データ分離

- 外部キー制約によりデータ整合性を保証
- CASCADE削除によりユーザー削除時の孤立レコードを防止
- UUID主キーにより予測不可能な識別子を提供

## パフォーマンス考慮事項

### インデックス戦略

- **ユーザーベースクエリ**: 効率的なユーザーデータ取得のため`user_id`にインデックス
- **ステータスフィルタ**: 処理キュー管理のため`status`にインデックス
- **時系列クエリ**: 時系列ソートのため`created_at`にインデックス
- **会社連携**: 連携クエリのため`freee_company_id`にインデックス

### クエリパターン

これらのインデックスがサポートする典型的なクエリパターン：

```sql
-- ユーザーのステータス別領収書
SELECT * FROM receipts WHERE user_id = $1 AND status = 'pending';

-- ユーザーの最新領収書
SELECT * FROM receipts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10;

-- 会社別ユーザー設定
SELECT * FROM user_settings WHERE freee_company_id = $1;
```

## マイグレーション情報

- **マイグレーションファイル**: `supabase/migrations/001_core_tables.sql`
- **依存関係**: Supabaseプロジェクト初期化（PBI-1-1-1）が必要
- **使用機能**: PostgreSQL 14+、UUID拡張、JSONB、RLS、トリガー

## TypeScript連携

TypeScriptインターフェースは`src/types/database/core.ts`で定義され、データベーススキーマと完全に一致しています。

## 将来の考慮事項

これらのコアテーブルは以下による拡張を想定して設計されています：

- トランザクション照合テーブル（PBI-1-1-3）
- 追加のユーザー設定フィールド
- 拡張OCRデータ構造
- 監査ログ拡張
