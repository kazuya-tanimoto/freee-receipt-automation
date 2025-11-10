-- Migration: Create main application tables
-- Description: レシート処理システムの主要テーブル作成
-- Created: 2025-11-10

-- ============================================================================
-- 1. receipts テーブル - レシート処理データの主テーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS receipts (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    amount DECIMAL(10, 2),
    status TEXT NOT NULL CHECK (status IN ('success', 'pending', 'failed')),
    processed_at TIMESTAMP DEFAULT NOW(),

    -- 処理ステータス情報
    current_step TEXT CHECK (current_step IN ('ocr', 'parsing', 'matching', 'registration', 'completed')),
    current_status TEXT CHECK (current_status IN ('pending', 'processing', 'success', 'failed')),
    status_message TEXT,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100),

    -- OCR処理結果
    ocr_text TEXT,
    ocr_confidence DECIMAL(3, 2) CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),

    -- マッチング結果
    match_partner TEXT,
    match_amount DECIMAL(10, 2),
    match_account TEXT,
    match_confidence DECIMAL(3, 2) CHECK (match_confidence >= 0 AND match_confidence <= 1),

    -- freee登録結果
    freee_transaction_id TEXT,
    registration_success BOOLEAN,
    registration_error TEXT,

    -- タイムスタンプ
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- receiptsテーブルのインデックス
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_processed_at ON receipts(processed_at DESC);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);

-- ============================================================================
-- 2. processing_logs テーブル - 処理ログ・エラー追跡
-- ============================================================================
CREATE TABLE IF NOT EXISTS processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    message TEXT,
    error_details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- processing_logsテーブルのインデックス
CREATE INDEX idx_processing_logs_receipt_id ON processing_logs(receipt_id);
CREATE INDEX idx_processing_logs_created_at ON processing_logs(created_at DESC);

-- ============================================================================
-- 3. auth_tokens テーブル - OAuth認証トークン保存
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL CHECK (service IN ('gmail', 'freee', 'google_drive')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- サービスごとに1レコードのみ（個人利用想定）
    UNIQUE(service)
);

-- ============================================================================
-- 4. RLS（Row Level Security）設定
-- ============================================================================
-- 個人利用システムのため、全アクセス許可ポリシーを採用

-- receiptsテーブルのRLS有効化
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users"
ON receipts FOR ALL
USING (true)
WITH CHECK (true);

-- processing_logsテーブルのRLS有効化
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users"
ON processing_logs FOR ALL
USING (true)
WITH CHECK (true);

-- auth_tokensテーブルのRLS有効化
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for all users"
ON auth_tokens FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 5. updated_at自動更新トリガー
-- ============================================================================
-- receiptsテーブルのupdated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- receiptsテーブルのトリガー
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- auth_tokensテーブルのトリガー
CREATE TRIGGER update_auth_tokens_updated_at
    BEFORE UPDATE ON auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. 初期データ（オプション）
-- ============================================================================
-- 開発・テスト用のサンプルデータは不要（本番環境想定）
