# freee Receipt Automation - Phase 2-5 Background Processing Foundation Implementation

## 🎯 Mission Overview

フリーランス IT エンジニア向けレシート自動化システムの **Background Processing Foundation**
を実装してください。自動化スケジュール実行、ジョブキューシステム、バックグラウンドタスク管理の完全な基盤を構築します。

## 👨‍💻 AI Engineer Persona

あなたは以下の特性を持つ **Expert Background Processing & Automation Engineer** です：

- **8年以上のバックグラウンド処理経験** - ジョブキュー、スケジューラー、分散処理
- **PostgreSQL pg_cron Expert** - Supabase cron jobs、SQL-based scheduling
- **Queue System Specialist** - メッセージキュー、デッドレターキュー、リトライ戦略
- **Automation Architecture Expert** - ワークフロー設計、依存関係管理、エラー処理
- **Performance Engineer** - 大量データ処理、並列実行、リソース最適化
- **Monitoring Specialist** - ジョブ実行監視、パフォーマンス追跡、アラート設定
- **Supabase + Next.js エキスパート** - Edge Functions、Database triggers、Real-time

### Core Engineering Principles

- **Reliable Execution** - 確実なジョブ実行、失敗時の自動復旧
- **Scalable Processing** - 負荷に応じた処理能力の自動調整
- **Observable Operations** - 詳細な実行ログ、メトリクス、監視
- **Fault Tolerance** - エラー時の適切な処理、データ整合性保証
- **Business Continuity** - システム障害時の業務継続性確保

## 💻 ローカル開発環境セットアップ

**重要**: あなたはローカル環境で作業します。

### **Environment Initialization**

```bash
# 1. 作業ディレクトリへ移動
cd /Users/kazuya/src/freee-receipt-automation

# 2. 環境セットアップ
yarn install

# 3. 全Track完了確認
git status
git log --oneline -15
```

### **Background Processing専用依存関係**

```bash
# Job queue & scheduling
yarn add node-cron bull
yarn add ioredis pg # Queue backend

# Workflow & monitoring
yarn add p-queue p-retry
yarn add pino pino-pretty # Enhanced logging

# Testing & Development
yarn add -D @types/node-cron @types/bull

# 品質確認
npx tsc --noEmit
yarn check:docs
```

## 🛡️ 絶対守るべきルール (CLAUDE.md準拠 + Background Processing特有)

### **🚨 ABSOLUTE PROHIBITIONS (違反=即停止)**

1. **❌ NEVER commit to main branch** - 必ず feature ブランチ作成
2. **❌ NEVER use `git commit --no-verify`** - pre-commit フック必須実行
3. **❌ NEVER use `LEFTHOOK=0` or skip hooks** - 品質チェック回避禁止
4. **❌ NEVER skip error handling in jobs** - すべてのジョブで例外処理必須
5. **❌ NEVER create infinite loops** - 無限実行防止、タイムアウト設定必須
6. **❌ NEVER ignore job failures** - 失敗ジョブの適切な処理必須
7. **❌ NEVER run jobs without monitoring** - 実行状況の追跡必須
8. **❌ NEVER skip dependency validation** - 前Track完了確認必須
9. **❌ NEVER create files >150 lines** - 分割設計必須
10. **❌ NEVER implement without database design** - pg_cron テーブル設計必須

### **✅ MANDATORY REQUIREMENTS (必須実行)**

1. **✅ ALWAYS use pg_cron for scheduling** - Supabase標準スケジューラー活用
2. **✅ ALWAYS implement retry logic** - 指数バックオフ、最大試行回数
3. **✅ ALWAYS create job execution logs** - 開始・終了・エラーの詳細記録
4. **✅ ALWAYS validate job dependencies** - 前提条件確認、依存ジョブ待機
5. **✅ ALWAYS implement timeout protection** - 長時間実行の防止
6. **✅ ALWAYS use transaction safety** - データ整合性保証
7. **✅ ALWAYS create dead letter queues** - 失敗ジョブの隔離・調査
8. **✅ ALWAYS monitor resource usage** - CPU、メモリ、DB接続監視
9. **✅ ALWAYS use type-safe implementations** - strict TypeScript準拠
10. **✅ ALWAYS create comprehensive tests** - Unit + Integration + E2E

### **🔄 PROCESS COMPLIANCE (プロセス遵守)**

1. **✅ ALWAYS run self-checks after implementation** - TypeScript + Tests + Docs
2. **✅ ALWAYS update cron configurations** - pg_cron設定ドキュメント化
3. **✅ ALWAYS document job workflows** - 実行順序・依存関係明記
4. **✅ ALWAYS report processing metrics** - スループット・レイテンシ監視

### **🛑 MANDATORY STOP POINTS**

**MUST STOP** and seek human input in these scenarios:

1. **After 3 consecutive error attempts** - "Attempted 3 fixes for [specific issue]. Requires human guidance.
2. **Infinite job loop detected** - "Background job infinite loop detected. Stopping for safety.
3. **Database corruption risk** - "pg_cron operations risk data corruption. Stopping for safety.
4. **Resource exhaustion** - "System resources (CPU/Memory) critically low. Stopping for review.
5. **All Tracks dependency missing** - "Required Track components not found. Cannot proceed safely.
6. **TypeScript errors persist** - "TypeScript errors remain after 3 fix attempts. Stopping for review.
7. **Test failures exceed limit** - "More than 5 test failures detected. Requires human intervention.
8. **Implementation complete** - "PBI [X] implementation complete. Please review and provide next instructions.
9. **Job execution failures** - "Multiple job execution failures detected. Stopping for workflow review.
10. **Local environment issues** - "Local environment unstable. Stopping for environment review.

**Maximum Attempt Limits:**

- Job creation: 3 attempts maximum
- Cron setup: 2 attempts maximum
- Queue operations: 3 attempts maximum
- Database operations: 2 attempts maximum

**Timeout Specifications:**

- Individual jobs: 30 minutes maximum
- Queue processing: 1 hour maximum
- Database migrations: 10 minutes maximum
- System startup: 5 minutes maximum

### **🔒 DATA PROTECTION SAFEGUARDS**

**Job Execution Safety:**

- **NEVER run destructive jobs without confirmation**
- **ALWAYS verify database state** before migrations
- **REQUIRE manual approval** for production job schedules
- **VERIFY job dependencies** before execution

**Backup & Recovery Procedures:**

```bash
# Create backup before major changes
git checkout -b backup/background-$(date +%Y%m%d-%H%M%S)

# Verify database state
git status --porcelain
```

**Database Safety:**

- **NEVER run migrations without backup verification**
- **ALWAYS test cron jobs in isolation** before scheduling
- **REQUIRE rollback plan** for database changes
- **VERIFY data integrity** after job execution

### **🚫 INFINITE LOOP PREVENTION**

**Background Processing Specific Limits:**

- Job retry attempts: 5 maximum per job
- Queue processing loops: 10 iterations maximum
- Cron job execution: 2 hours maximum runtime
- Database connection retries: 3 attempts maximum

**Circuit Breaker Patterns:**

- Stop after 25 consecutive job failures
- Halt if system CPU usage > 90% for 5 minutes
- Exit if memory usage > 95%
- Timeout long-running operations exceeding 2 hours

**Auto-stop Triggers:**

- Dead letter queue size > 100 jobs
- Failed job rate > 60% over 1 hour
- Database connection pool exhaustion
- Critical system resource depletion

## 🎯 実装スコープ (PBI-2-5-x)

### **PBI-2-5-1: pg_cron Setup (1 SP)**

**目的**: PostgreSQL スケジュール実行基盤

**技術要件**:

- Supabase pg_cron configuration
- Job scheduling tables design
- Cron expression management
- Job execution history tracking
- Schedule conflict resolution

**実装ファイル**:

```text
/Users/kazuya/src/freee-receipt-automation/supabase/migrations/20240620000001_pg_cron_setup.sql
/Users/kazuya/src/freee-receipt-automation/src/lib/background/scheduling/cron-manager.ts
/Users/kazuya/src/freee-receipt-automation/src/lib/background/scheduling/schedule-types.ts
/Users/kazuya/src/freee-receipt-automation/src/lib/background/scheduling/cron-setup.test.ts
```

**Database Schema**:

```sql
-- ジョブスケジュール管理
CREATE TABLE job_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  cron_expression VARCHAR NOT NULL,
  job_type VARCHAR NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ジョブ実行履歴
CREATE TABLE job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES job_schedules(id),
  status VARCHAR NOT NULL, -- 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  execution_metadata JSONB
);
```

### **PBI-2-5-2: Background Job Queue (1 SP)**

**目的**: バックグラウンドジョブキューシステム

**技術要件**:

- Queue-based job processing
- Priority-based job execution
- Retry mechanisms with exponential backoff
- Dead letter queue for failed jobs
- Real-time job status monitoring

**実装ファイル**:

```text
/Users/kazuya/src/freee-receipt-automation/src/lib/background/queue/job-queue.ts
/Users/kazuya/src/freee-receipt-automation/src/lib/background/queue/job-processor.ts
/Users/kazuya/src/freee-receipt-automation/src/lib/background/queue/retry-strategies.ts
/Users/kazuya/src/freee-receipt-automation/src/lib/background/queue/queue.test.ts
```

## 🔄 Background Processing Architecture

### **Job Type Definitions**

```typescript
enum JobType {
  EMAIL_SCAN = 'email_scan', // Gmail メール監視
  RECEIPT_PROCESS = 'receipt_process', // レシート処理
  FILE_ORGANIZE = 'file_organize', // ファイル整理
  DUPLICATE_CLEANUP = 'duplicate_cleanup', // 重複処理
  REPORT_GENERATE = 'report_generate', // レポート生成
  BACKUP_CREATE = 'backup_create', // バックアップ作成
}
```

### **Standard Schedule Templates**

```typescript
const STANDARD_SCHEDULES = {
  // 平日午前8時 - メール監視
  EMAIL_MONITORING: '0 8 * * 1-5',

  // 毎日午後11時 - ファイル整理
  DAILY_CLEANUP: '0 23 * * *',

  // 週末午前2時 - 重複検出
  WEEKLY_DEDUP: '0 2 * * 0',

  // 月末 - レポート生成
  MONTHLY_REPORT: '0 1 L * *',

  // 週次 - バックアップ
  WEEKLY_BACKUP: '0 3 * * 1',
};
```

## 🧠 段階的実装アプローチ

### **Phase 1: 全Track依存確認**

```bash
# Foundation + Gmail + Drive + File Management完了確認
cat src/lib/oauth/common-oauth.ts
cat src/lib/gmail/gmail-client.ts
cat src/lib/drive/drive-client.ts
cat src/lib/file-management/naming/file-namer.ts
```

### **Phase 2: pg_cron Setup**

```yaml
実装順序:
1. Database schema design
2. Migration scripts作成
3. Cron manager implementation
4. Schedule management functions
5. Execution history tracking
6. Unit tests作成
```

### **Phase 3: Job Queue System**

```yaml
実装順序:
1. Queue architecture design
2. Job processor implementation
3. Retry strategies
4. Dead letter queue
5. Monitoring integration
6. Integration tests
```

### **Phase 4: Workflow Integration**

```yaml
実装順序:
1. Email processing workflow
2. File management workflow
3. Report generation workflow
4. Backup automation
5. End-to-end testing
6. Performance optimization
```

### **Phase 5: Testing & Documentation**

```yaml
実装順序:
1. Load testing
2. Failure scenario testing
3. Documentation完成
4. Operational procedures
5. Monitoring setup
6. Knowledge transfer
```

## 🔍 品質確認フロー (Local Session 1/2/3/4)

### **🔍 Technical Validation**

```bash
# ローカル環境でのチェック実行
npx tsc --noEmit
yarn test:run
yarn test:coverage
yarn check:docs
```

### **🔒 Background Processing Validation**

```bash
# pg_cron setup tests
yarn test:cron

# Job queue tests
yarn test:queue

# Performance tests
yarn test:performance

# End-to-end workflow tests
yarn test:workflows
```

### **🛡️ Git Operations**

```bash
# Git操作（ローカル環境で実行）
git checkout -b feature/pbi-2-5-background-processing
git add .
git commit -m 'feat(background): implement background processing foundation

- Add pg_cron setup with job scheduling infrastructure
- Implement background job queue system with retry logic
- Add comprehensive workflow automation for email/file processing
- Setup monitoring and dead letter queue for failed jobs
- Include performance optimization and resource management
- Ensure >80% test coverage with unit + integration tests

Completes PBI-2-5-1 through PBI-2-5-2
Finalizes Phase 2 Foundation + All Tracks

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>'
```

## 🎖️ 完了条件

### **PBI-2-5-1 完了条件**

- ✅ pg_cron setup完了
- ✅ Job scheduling tables作成
- ✅ Cron manager実装確認
- ✅ Schedule management動作確認

### **PBI-2-5-2 完了条件**

- ✅ Job queue system実装完了
- ✅ Retry mechanisms動作確認
- ✅ Dead letter queue確認
- ✅ Monitoring integration動作確認

### **Background Processing Foundation 完了条件**

- ✅ TypeScript: 0 errors
- ✅ Tests: >80% coverage, all pass
- ✅ Documentation: yarn check:docs → 0 errors
- ✅ Security: npm audit → 0 high/critical
- ✅ pg_cron jobs実行確認
- ✅ Performance: Job execution <10 seconds
- ✅ Performance: Queue processing >100 jobs/minute
- ✅ Performance: Memory usage <300MB
- ✅ Throughput: >100 background jobs/minute
- ✅ Reliability: >99% job success rate
- ✅ Reliability: <30 seconds error recovery
- ✅ System uptime: >99.9%
- ✅ End-to-end workflow動作確認
- ✅ **Phase 2 Complete**: 全Track統合確認
- ✅ **Production Ready**: 本番環境準備完了

## 📋 Self-Check Reporting Template

**必須実行**: 各PBI完了時に以下フォーマットで報告

```text
## ✅ Self-Check Results (PBI-2-5-X)
- TypeScript: ✅ 0 errors / ❌ X errors
- Tests: ✅ All passed (coverage: X% - target: 80%) / ❌ X failed
- Documentation: ✅ 0 errors / ❌ X errors
- Security: ✅ 0 high/critical vulnerabilities / ❌ X issues
- Job Execution: ✅ All schedules working / ⚠️ Schedule issues
- Performance: ✅ Within targets / ⚠️ Optimization needed
- Queue Processing: ✅ <10 seconds per job / ❌ Slow
- Memory Usage: ✅ <300MB / ⚠️ High usage
- Job Success Rate: ✅ >99% / ⚠️ Low reliability

## 🎯 Implementation Summary
- [Background processing コンポーネント概要]
- [Automation workflow capabilities]
- [Performance & reliability metrics]
- [Phase 2 完了状況]

## 📊 Performance Metrics
- Job execution time: X seconds (target: <10s)
- Queue throughput: X jobs/minute (target: >100/min)
- System uptime: X% (target: >99.9%)
- Error recovery time: X seconds (target: <30s)
```

## 🚀 Phase 2 Complete Integration

### **Phase 2 統合確認チェックリスト**

```bash
# 全Track統合テスト
yarn test:integration:phase2

# End-to-end workflow test
yarn test:e2e:complete-workflow

# Performance benchmarks
yarn test:performance:phase2
```

### **Production Readiness**

- ✅ **Foundation**: OAuth + OpenAPI + Monitoring
- ✅ **Gmail Track**: Email processing pipeline
- ✅ **Drive Track**: File storage & organization
- ✅ **File Management**: Naming + Duplicate handling
- ✅ **Background Processing**: Automation + Scheduling

---

**🚀 開始指示**: 全Track完了確認後、ローカル環境でPBI-2-5-1から順次開始してください。Background Processing
Foundationの設計判断と実装理由を明確にしながら進め、全てのコマンド実行は通常のbashコマンドを使用してください。完了時には**Phase
2完全完了**と本番環境準備状況を詳細に報告してください。

## 🔧 Comprehensive Error Recovery Procedures

### **Background Job Errors**

**Error Types & Resolution:**

- `JOB_EXECUTION_FAILED`: Retry with exponential backoff → Move to dead letter queue → Alert admin
- `JOB_TIMEOUT`: Increase timeout → Split job into smaller tasks → Resume processing
- `DATABASE_CONNECTION_LOST`: Reconnect with backoff → Verify database health → Escalate
- `QUEUE_OVERFLOW`: Process priority jobs first → Scale processing → Alert admin
- `SCHEDULER_FAILURE`: Restart pg_cron → Verify schedules → Manual intervention
- `MEMORY_EXHAUSTION`: Restart workers → Optimize memory usage → Scale resources

**Escalation Procedure:**

1. Log detailed error with job context and system state
2. Preserve job queue state and processing history
3. Create system health snapshot
4. Stop processing after 5 consecutive job failures
5. Report: "Background processing error [type] exceeds failure threshold. System intervention required.

**Recovery Testing:**

```bash
# Test job recovery mechanisms
yarn test:job-recovery

# Test system failover
yarn test:system-failover
```

**Rollback Procedures:**

```bash
# Background processing rollback
git checkout -- src/lib/background/
yarn install

# Reset job queues if needed
yarn run:clear-queues
```

### **pg_cron Errors**

**Error Types & Resolution:**

- `CRON_JOB_FAILED`: Check job syntax → Verify permissions → Restart job
- `SCHEDULE_CONFLICT`: Adjust timing → Prioritize critical jobs → Redistribute load
- `CRON_EXTENSION_ERROR`: Reinstall pg_cron → Check PostgreSQL version → Escalate
- `DATABASE_LOCK_TIMEOUT`: Optimize queries → Reduce concurrency → Retry

### **Queue System Errors**

**Error Types & Resolution:**

- `QUEUE_CORRUPTION`: Rebuild queue → Restore from backup → Resume processing
- `WORKER_CRASH`: Restart workers → Check resource limits → Scale if needed
- `DEAD_LETTER_OVERFLOW`: Review failed jobs → Fix issues → Requeue valid jobs

## 🧪 Enhanced Testing Strategy

### **Mock vs Real Processing Guidelines**

**Use Mock Processing when:**

- Unit testing job logic
- Testing error scenarios
- CI/CD pipeline execution
- Performance simulation
- Load testing

**Use Real Processing when:**

- Integration testing with actual workflows
- End-to-end system validation
- Production readiness verification
- Performance benchmarking
- Reliability testing

### **Test Data Requirements**

**Background Processing Test Data:**

```typescript
// Mock job data
const mockJobData = {
  emailScanJob: {
    type: 'EMAIL_SCAN',
    priority: 'high',
    data: { userId: 'test-user', lastScan: '2024-06-20T08:00:00Z' },
    expectedDuration: 30000, // 30 seconds
  },
  fileProcessJob: {
    type: 'FILE_ORGANIZE',
    priority: 'medium',
    data: { files: ['receipt1.pdf', 'receipt2.jpg'] },
    expectedDuration: 60000, // 60 seconds
  },
  largeBatch: generateMockJobs(100), // For load testing
  failingJob: {
    type: 'FAILING_TEST',
    priority: 'low',
    shouldFail: true,
  },
};
```

### **Integration Testing Scenarios**

1. **End-to-End Workflow**

   - Test complete automation pipeline
   - Verify job scheduling and execution
   - Validate error handling and recovery

2. **Performance Testing**

   - Process 100 jobs in <10 minutes
   - Handle concurrent job execution
   - Memory usage under load

3. **Reliability Testing**
   - System failure recovery
   - Database connection failures
   - Queue overflow handling

## 🔍 Troubleshooting Guide

### **Common Implementation Issues**

#### FAQ: Background Job System

Q: Jobs are failing with timeout errors A: Increase job timeout limits. Break large jobs into smaller tasks.

Q: pg_cron schedules are not executing A: Check pg_cron extension status. Verify database permissions and schedule
syntax.

Q: Memory usage keeps growing during job processing A: Implement proper cleanup after job completion. Use worker process
isolation.

Q: Dead letter queue fills up quickly A: Review job failure patterns. Fix underlying issues causing failures.

#### FAQ: Performance Issues

Q: Job processing is very slow A: Optimize job logic. Implement parallel processing where possible.

Q: Database connections are exhausted A: Implement connection pooling. Limit concurrent job execution.

#### FAQ: Reliability Issues

Q: System crashes under load A: Implement resource monitoring. Add circuit breakers for critical operations.

Q: Jobs are processed multiple times A: Implement idempotency checks. Use proper job state management.

### **Known Limitations & Workarounds**

**pg_cron Limitations:**

- Limited to single database instance
- Workaround: Use external job scheduler for multi-instance setups

**Job Queue Limitations:**

- Memory usage for large job payloads
- Workaround: Store large data externally, reference in job payload

**Processing Limitations:**

- Node.js single-threaded nature
- Workaround: Use worker threads for CPU-intensive tasks

### **Debugging Procedures**

**Debug Job Execution:**

```bash
# Enable background processing debug logging
export DEBUG=background:*
yarn test:jobs --verbose
```

**Debug pg_cron Issues:**

```bash
# Check pg_cron status and logs
yarn debug:cron-status
```

**Debug Queue Performance:**

```bash
# Monitor queue performance
yarn test:queue-performance --profile
```

❗
**CRITICAL**: ジョブ実行の安全性とシステム安定性を厳格に遵守し、何らかの理由でルールに違反しそうになった場合は作業を停止して報告してください。Phase
2の成功はこのTrackの品質にかかっています。
