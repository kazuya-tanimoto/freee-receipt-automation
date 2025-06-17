-- RLS Policies for freee Receipt Automation System
-- This migration sets up Row Level Security policies
-- for all user data tables to ensure proper data isolation

-- Enable RLS on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
-- Users can only access their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

-- Receipt Policies
-- Users can only access their own receipts
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts" ON public.receipts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts" ON public.receipts
  FOR DELETE USING (auth.uid() = user_id);

-- Transaction Policies
-- Users can only access their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Processing Log Policies
-- Users can only access their own processing logs
CREATE POLICY "Users can view own logs" ON public.processing_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON public.processing_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Processing logs should be immutable for regular users
-- Only allow deletion for cleanup operations by system administrators
CREATE POLICY "Prevent log deletion" ON public.processing_logs
  FOR DELETE USING (false);

-- Comments for future reference
COMMENT ON POLICY "Users can view own settings" ON public.user_settings IS
  'Allows users to view only their own settings using auth.uid()';

COMMENT ON POLICY "Users can view own receipts" ON public.receipts IS
  'Allows users to view only their own receipts using user_id foreign key';

COMMENT ON POLICY "Users can view own transactions" ON public.transactions IS
  'Allows users to view only their own transactions using user_id foreign key';

COMMENT ON POLICY "Users can view own logs" ON public.processing_logs IS
  'Allows users to view only their own processing logs using user_id foreign key';

COMMENT ON POLICY "Prevent log deletion" ON public.processing_logs IS
  'Processing logs are immutable audit records and should never be deleted by regular users';