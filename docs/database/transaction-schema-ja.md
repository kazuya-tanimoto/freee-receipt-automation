# トランザクションテーブルスキーマドキュメント

## 概要

このドキュメントは、PBI-1-1-3で実装されたトランザクション関連のデータベーステーブルについて説明します。
これらのテーブルは、freee API統合、レシート-トランザクション照合、システム操作ログを管理します。

## テーブル

### transactions

freee APIからのトランザクションデータを保存し、レシート照合関係を管理します。

| カラム名               | 型                  | 制約                        | 説明                            |
|-----------------------|---------------------|----------------------------|---------------------------------|
| id                    | UUID                | PRIMARY KEY, DEFAULT uuid_generate_v4() | 一意のトランザクションID |
| user_id               | UUID                | NOT NULL, FK auth.users(id) CASCADE | このトランザクションを所有するユーザー |
| freee_transaction_id  | TEXT                | UNIQUE                     | freee APIからの一意識別子       |
| amount                | DECIMAL(10, 2)      | NOT NULL                   | 精度付きトランザクション金額     |
| date                  | DATE                | NOT NULL                   | トランザクション日付            |
| description           | TEXT                | NOT NULL                   | トランザクション説明            |
| category              | TEXT                |                            | トランザクションカテゴリ        |
| account_item_id       | INTEGER             |                            | freee勘定項目ID                |
| matched_receipt_id    | UUID                | FK receipts(id) SET NULL   | 関連レシート（照合済みの場合）   |
| matching_confidence   | DECIMAL(3, 2)       | CHECK (0 <= value <= 1)   | 自動照合信頼度スコア            |
| matching_status       | TEXT                | DEFAULT 'unmatched', CHECK | 現在の照合ステータス            |
| freee_data            | JSONB               |                            | 元のfreee APIレスポンス         |
| created_at            | TIMESTAMPTZ         | DEFAULT NOW()              | レコード作成タイムスタンプ      |
| updated_at            | TIMESTAMPTZ         | DEFAULT NOW()              | レコード最終更新タイムスタンプ  |

#### 照合ステータス値

- `unmatched`: このトランザクションに照合されたレシートなし
- `auto_matched`: システムによって自動照合済み
- `manual_matched`: ユーザーによって手動照合済み
- `rejected`: ユーザーが自動照合提案を拒否

### processing_logs

デバッグおよび監視目的でシステム操作を追跡します。

| カラム名                  | 型          | 制約                           | 説明                         |
|--------------------------|-------------|--------------------------------|------------------------------|
| id                       | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4() | 一意のログエントリID |
| user_id                  | UUID        | NOT NULL, FK auth.users(id) CASCADE | 操作に関連するユーザー |
| process_type             | TEXT        | NOT NULL, CHECK IN (...)       | ログされるプロセスの種類      |
| status                   | TEXT        | NOT NULL, CHECK IN (...)       | プロセスの現在ステータス      |
| details                  | JSONB       | DEFAULT '{}'                   | プロセス固有の追加データ      |
| error_message            | TEXT        |                                | プロセス失敗時のエラーメッセージ |
| duration_ms              | INTEGER     |                                | プロセス実行時間（ミリ秒）    |
| related_receipt_id       | UUID        | FK receipts(id) SET NULL       | 関連レシート（該当する場合）  |
| related_transaction_id   | UUID        | FK transactions(id) SET NULL   | 関連トランザクション（該当する場合） |
| created_at               | TIMESTAMPTZ | DEFAULT NOW()                  | ログエントリ作成タイムスタンプ |

#### プロセス種別値

- `ocr`: レシート画像のOCR処理
- `freee_sync`: freee APIとの同期
- `matching`: レシート-トランザクション照合操作
- `notification`: メール/通知送信
- `cleanup`: データクリーンアップおよびメンテナンス操作

#### プロセスステータス値

- `started`: プロセスが開始済み
- `completed`: プロセスが正常終了
- `failed`: プロセスでエラーが発生
- `cancelled`: ユーザーまたはシステムによってプロセスがキャンセル

## インデックス

### transactionsテーブル

- `idx_transactions_user_id`: ユーザーベースの高速クエリ
- `idx_transactions_date`: レポート用の日付範囲フィルタリング
- `idx_transactions_freee_id`: freee API同期（部分インデックス）
- `idx_transactions_matched_receipt`: レシート照合クエリ（部分インデックス）
- `idx_transactions_matching_status`: ステータスベースのフィルタリング

### processing_logsテーブル

- `idx_processing_logs_user_id`: ユーザー固有のログクエリ
- `idx_processing_logs_type_status`: プロセス監視とフィルタリング
- `idx_processing_logs_created_at`: 時間ベースのログ取得
- `idx_processing_logs_related_receipt`: レシート関連ログクエリ（部分インデックス）
- `idx_processing_logs_related_transaction`: トランザクション関連ログクエリ（部分インデックス）

## セキュリティ

### 行レベルセキュリティ（RLS）

両テーブルは、ユーザーが自分のデータのみにアクセスできることを保証するRLSポリシーを実装しています：

#### transactionsテーブルポリシー

- `Users can view own transactions`: 自分のレコードのSELECT
- `Users can insert own transactions`: user_id検証付きINSERT
- `Users can update own transactions`: 自分のレコードのUPDATE
- `Users can delete own transactions`: 自分のレコードのDELETE

#### processing_logsテーブルポリシー

- `Users can view own processing logs`: 自分のレコードのSELECT
- `Users can insert own processing logs`: user_id検証付きINSERT

注意: 処理ログは通常追記専用のため、UPDATE/DELETEポリシーは実装されていません。

## パフォーマンス考慮事項

### インデックス戦略

- NULL可能な外部キーの部分インデックスによる容量節約
- 一般的なクエリパターン向けの複合インデックス
- ログデータアーカイブ用の時間ベースインデックス

### クエリ最適化

- 繰り返しクエリにはプリペアドステートメントを使用
- 柔軟なデータクエリにJSONB演算子を活用
- 大量の処理ログに対してはパーティショニングを検討

## データ整合性

### 外部キー制約

- ユーザー所有データのCASCADE削除
- 孤立レコードを防ぐためのオプショナル関係のSET NULL

### チェック制約

- ステータスフィールドのEnum検証
- 信頼度スコアの範囲検証
- データベースレベルでのデータ型検証

## 使用例

### 一般的なクエリ

```sql
-- ユーザーの未照合トランザクションを取得
SELECT * FROM transactions 
WHERE user_id = $1 AND matching_status = 'unmatched'
ORDER BY date DESC;

-- 失敗した操作の処理ログを取得
SELECT * FROM processing_logs 
WHERE user_id = $1 AND status = 'failed'
ORDER BY created_at DESC;

-- 高信頼度自動照合トランザクションを取得
SELECT * FROM transactions 
WHERE user_id = $1 
  AND matching_status = 'auto_matched' 
  AND matching_confidence > 0.8;
```

### JSONデータの例

```sql
-- freee APIレスポンスを保存
INSERT INTO transactions (user_id, freee_data, ...) 
VALUES ($1, '{"api_version": "v1", "sync_time": "2024-01-01T00:00:00Z"}', ...);

-- 処理詳細を保存
INSERT INTO processing_logs (user_id, process_type, details, ...) 
VALUES ($1, 'ocr', '{"confidence": 0.95, "text_lines": 15}', ...);
```

## マイグレーション注意事項

- マイグレーションファイル: `supabase/migrations/002_transaction_tables.sql`
- 依存関係: `001_core_tables.sql`（receiptsテーブル用）
- 自動生成UUID主キー
- updated_atカラム用のタイムスタンプトリガー

## 関連ドキュメント

- [コアスキーマドキュメント](./core-schema-ja.md)
- [API統合ガイド](../api/)
- [セキュリティガイドライン](../ops/operational-guidelines.md)
