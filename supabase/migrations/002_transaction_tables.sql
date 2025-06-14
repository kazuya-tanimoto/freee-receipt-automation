-- PBI-1-1-3: Transaction Tables Creation
-- Create transaction-related database tables for freee receipt automation system

-- Transactions table for storing freee API data and matching information
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

-- Processing logs table for tracking system operations and debugging
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

-- Performance optimization indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_freee_id ON public.transactions(freee_transaction_id) WHERE freee_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_matched_receipt ON public.transactions(matched_receipt_id) WHERE matched_receipt_id IS NOT NULL;
CREATE INDEX idx_transactions_matching_status ON public.transactions(matching_status);

CREATE INDEX idx_processing_logs_user_id ON public.processing_logs(user_id);
CREATE INDEX idx_processing_logs_type_status ON public.processing_logs(process_type, status);
CREATE INDEX idx_processing_logs_created_at ON public.processing_logs(created_at);
CREATE INDEX idx_processing_logs_related_receipt ON public.processing_logs(related_receipt_id) WHERE related_receipt_id IS NOT NULL;
CREATE INDEX idx_processing_logs_related_transaction ON public.processing_logs(related_transaction_id) WHERE related_transaction_id IS NOT NULL;

-- Apply updated_at trigger to transactions table
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON public.transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for data isolation
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions table - users can only access their own data
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for processing_logs table - users can only access their own logs
CREATE POLICY "Users can view own processing logs" ON public.processing_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processing logs" ON public.processing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Processing logs are typically append-only, so no UPDATE/DELETE policies