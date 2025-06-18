# PBI-1-1-3: トランザクションテーブル作成

## 説明

freeeレシート自動化システムのトランザクション関連データベーステーブルを作成します。これには、freee
APIデータを保存するためのtransactionsテーブルと、システムの操作を追跡し、デバッグを行うためのprocessing_logsテーブルが含まれます。

## 実装詳細

### 作成/修正するファイル

1. `supabase/migrations/002_transaction_tables.sql` - トランザクションテーブル作成
2. `src/types/database/transactions.ts` - トランザクションテーブル用のTypeScript型
3. `docs/database/transaction-schema.md` - トランザクションテーブルのドキュメント

### 技術要件

- PostgreSQL 14以降の機能を使用
- トランザクションクエリ用の適切なインデックスを有効化
- カスケード動作を含む外部キー制約を設定
- 監査フィールド（created_at、updated_at）を含める
- 柔軟なログデータ保存のためのJSONBをサポート

### データベーススキーマ

```sql
-- トランザクションテーブル
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freee_transaction_id TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  account_item_id INTEGER,
  matched_receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  matching_confidence DECIMAL(3, 2) CHECK (matching_confidence >= 0 AND matching_confidence <= 1),
  matching_status TEXT DEFAULT 'unmatched' CHECK (matching_status IN ('unmatched', 'auto_matched', 'manual_matched', 'rejected')),
  freee_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 処理ログテーブル
CREATE TABLE public.processing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_type TEXT NOT NULL CHECK (process_type IN ('ocr', 'freee_sync', 'matching', 'notification', 'cleanup')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
  details JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER,
  related_receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  related_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- パフォーマンス用のインデックス
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_freee_id ON transactions(freee_transaction_id);
CREATE INDEX idx_transactions_matched_receipt ON transactions(matched_receipt_id);
CREATE INDEX idx_transactions_matching_status ON transactions(matching_status);

CREATE INDEX idx_processing_logs_user_id ON processing_logs(user_id);
CREATE INDEX idx_processing_logs_type_status ON processing_logs(process_type, status);
CREATE INDEX idx_processing_logs_created_at ON processing_logs(created_at);
CREATE INDEX idx_processing_logs_related_receipt ON processing_logs(related_receipt_id);

-- トランザクションにupdated_atトリガーを適用
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 従うべきコードパターン

- 金額にはDECIMALを使用して浮動小数点の問題を回避
- enum的なフィールドにはCHECK制約を使用
- 柔軟なデータはJSONBフィールドに保存
- パフォーマンス監視のための実行時間追跡を含める

### インターフェース仕様

- **入力インターフェース**: PBI-1-1-2のreceiptsテーブルが必要
- **出力インターフェース**: マッチングとレポート用に利用可能なテーブル

  ```typescript
  interface Transaction {
    id: string;
    user_id: string;
    freee_transaction_id: string | null;
    amount: number;
    date: string;
    description: string;
    category: string | null;
    account_item_id: number | null;
    matched_receipt_id: string | null;
    matching_confidence: number | null;
    matching_status: 'unmatched' | 'auto_matched' | 'manual_matched' | 'rejected';
    freee_data: Record<string, any> | null;
    created_at: string;
    updated_at: string;
  }

  interface ProcessingLog {
    id: string;
    user_id: string;
    process_type: 'ocr' | 'freee_sync' | 'matching' | 'notification' | 'cleanup';
    status: 'started' | 'completed' | 'failed' | 'cancelled';
    details: Record<string, any>;
    error_message: string | null;
    duration_ms: number | null;
    related_receipt_id: string | null;
    related_transaction_id: string | null;
    created_at: string;
  }
  ```

## 受け入れ基準

- [ ] transactionsテーブルが適切な制約で作成されている
- [ ] processing_logsテーブルがenum検証で作成されている
- [ ] すべての外部キー関係が正しく機能している
- [ ] クエリパフォーマンス用のインデックスが適切に設定されている
- [ ] CHECK制約がenum値を検証している
- [ ] TypeScript型がデータベーススキーマと完全に一致している

## 依存関係

- **必須**: PBI-1-1-2 - コアテーブル（外部キー用のreceiptsテーブル）

## テスト要件

- ユニットテスト: TypeScript型のコンパイルをテスト
- 統合テスト: テーブル作成と外部キー制約をテスト
- テストデータ: サンプルトランザクションと処理ログ

## 見積もり

1ストーリーポイント

## 優先度

高 - freee統合にトランザクションデータ構造が必要

## 実装メモ

- 金額には精度を確保するためDECIMAL型を使用
- オリジナルのfreee APIレスポンスをfreee_data JSONBフィールドに保存
- パフォーマンス監視フィールド（duration_ms）を含める
- ユーザーやレシートが削除されたときのカスケード動作をテスト
