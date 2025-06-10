# PBI-2-5-2: データベーススキーマ

## ジョブキューテーブル

```sql
-- ジョブキューテーブルの作成
CREATE TABLE job_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0, -- 数値が大きいほど優先度が高い
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'dead_letter'))
);

-- 効率的なクエリのためのインデックス作成
CREATE INDEX idx_job_queue_status_priority ON job_queue(status, priority DESC, scheduled_at);
CREATE INDEX idx_job_queue_type_status ON job_queue(job_type, status);
CREATE INDEX idx_job_queue_scheduled_at ON job_queue(scheduled_at) WHERE status = 'pending';

-- デッドレターキューの作成
CREATE TABLE job_dead_letter_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_job_id UUID REFERENCES job_queue(id),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_history JSONB[] NOT NULL,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  resolution_status TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ
);

-- ジョブ処理ロックテーブル
CREATE TABLE job_processing_locks (
  job_id UUID PRIMARY KEY REFERENCES job_queue(id),
  worker_id TEXT NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

## ジョブロック関数

```sql
-- ジョブロック取得関数の作成
CREATE OR REPLACE FUNCTION acquire_job_lock(
  p_worker_id TEXT,
  p_job_types TEXT[],
  p_lock_duration INTERVAL DEFAULT '5 minutes'
)
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  priority INTEGER,
  payload JSONB
) AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- 次の利用可能なジョブを検索
  SELECT j.* INTO v_job
  FROM job_queue j
  WHERE j.status = 'pending'
    AND j.scheduled_at <= NOW()
    AND j.job_type = ANY(p_job_types)
    AND NOT EXISTS (
      SELECT 1 FROM job_processing_locks l
      WHERE l.job_id = j.id AND l.expires_at > NOW()
    )
  ORDER BY j.priority DESC, j.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job.id IS NULL THEN
    RETURN;
  END IF;

  -- ロックを作成
  INSERT INTO job_processing_locks (job_id, worker_id, expires_at)
  VALUES (v_job.id, p_worker_id, NOW() + p_lock_duration);

  -- ジョブステータスを更新
  UPDATE job_queue
  SET status = 'processing',
      started_at = NOW(),
      updated_at = NOW()
  WHERE id = v_job.id;

  RETURN QUERY SELECT v_job.id, v_job.job_type, v_job.priority, v_job.payload;
END;
$$ LANGUAGE plpgsql;
```

## ヘルパー関数

```sql
-- 期限切れロックのクリーンアップ関数
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM job_processing_locks
  WHERE expires_at < NOW();

  -- ロックされたが完了しなかったジョブをリセット
  UPDATE job_queue
  SET status = 'pending',
      started_at = NULL,
      updated_at = NOW()
  WHERE status = 'processing'
    AND NOT EXISTS (
      SELECT 1 FROM job_processing_locks l
      WHERE l.job_id = job_queue.id
    );
END;
$$ LANGUAGE plpgsql;

-- 5分ごとにクリーンアップを実行するようスケジュール
SELECT cron.schedule(
  'cleanup-expired-job-locks',
  '*/5 * * * *',
  'SELECT cleanup_expired_locks();'
);
```
