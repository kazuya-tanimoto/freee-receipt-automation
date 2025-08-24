-- PBI-2-05: PostgreSQL pg_cron extension setup for weekly automation
-- Enable pg_cron extension for scheduled job management
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create processing schedules table for schedule management
CREATE TABLE IF NOT EXISTS processing_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_name TEXT UNIQUE NOT NULL,
    cron_expression TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default weekly processing schedule
INSERT INTO processing_schedules (schedule_name, cron_expression) 
VALUES ('weekly-receipt-processing', '0 9 * * 1')
ON CONFLICT (schedule_name) DO NOTHING;

-- Schedule weekly receipt processing job
-- Calls Edge Function every Monday at 9:00 AM JST
SELECT cron.schedule(
    'weekly-receipt-processing',
    '0 9 * * 1',
    $$SELECT net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/weekly-process',
        headers := '{"Authorization": "Bearer service-role-key"}'::jsonb
    )$$
);