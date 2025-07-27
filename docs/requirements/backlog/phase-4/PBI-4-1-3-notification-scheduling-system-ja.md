# PBI-4-1-3: 通知スケジューリングと配信システム

## 説明

週次要約の定期配信、即座の重要アラート、ユーザー設定可能な配信タイミングに対応する通知スケジューリングシステムを、Supabase
Cronとデータベースキューで実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/services/notification/NotificationScheduler.ts` - メインスケジューリングサービス
2. `src/services/notification/NotificationQueue.ts` - キュー管理システム
3. `src/lib/scheduler/cron-jobs.ts` - Cronジョブ定義
4. `src/lib/scheduler/job-types.ts` - ジョブタイプ定義
5. `src/database/migrations/notifications.sql` - 通知テーブル
6. `src/services/notification/DeliveryService.ts` - 配信管理
7. `src/hooks/useNotificationScheduling.ts` - スケジューリング用Reactフック
8. `src/api/notifications/schedule.ts` - スケジューリング用APIエンドポイント

### 技術要件

- スケジュールされたジョブ実行用Supabase Cron
- キュー管理用Supabaseデータベーステーブル
- 配信ステータス更新用Webhook処理
- シンプルな再試行ロジック（最大3回）
- 基本的な失敗通知処理
- 優先度ベースのキュー処理

### スケジューリングアーキテクチャ

```typescript
interface NotificationJob {
  id: string;
  type: 'summary' | 'error' | 'action_required';
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduledAt: Date;
  userId: string;
  data: Record<string, any>;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface SchedulingConfig {
  summarySchedule: {
    dayOfWeek: number; // 0-6 (日曜日-土曜日)
    hour: number; // 0-23
    timezone: string;
  };
  immediateDelivery: {
    enabled: boolean;
    errorThresholds: {
      critical: number; // 秒
      high: number;
      medium: number;
    };
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
}

interface NotificationScheduler {
  scheduleWeeklySummary(userId: string, config: SchedulingConfig): Promise<string>;
  scheduleImmediateNotification(notification: NotificationJob): Promise<string>;
  cancelScheduledNotification(jobId: string): Promise<boolean>;
  updateSchedule(userId: string, config: SchedulingConfig): Promise<boolean>;
  getScheduledJobs(userId: string): Promise<NotificationJob[]>;
}
```

### 状態管理とキャッシュ

- 通知ステータスキャッシュ用React Query使用
- キューステータス管理用Zustandストア実装
- 頻繁にアクセスされるスケジューリングデータ用Redisキャッシュ
- キューステータス用WebSocketによるリアルタイム更新

### データベーススキーマ

```sql
CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  schedule_config JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  job_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### セキュリティ考慮事項

- スケジューリング操作のユーザー権限検証
- スケジューリングAPIエンドポイントのレート制限
- スケジューリングパラメータの入力検証
- キュー内通知データの安全な取り扱い

### パフォーマンス最適化

- 複数通知のバッチ処理
- データベース操作用接続プーリング
- ワーカースレッドによる効率的なキュー処理
- 大きな通知キューのメモリ最適化
- スケジューリングクエリ用データベースインデックス

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] 週次サマリー通知が正しくスケジュールされ配信される
- [ ] 即座の通知が設定された時間しきい値内で送信される
- [ ] 再試行ロジックが配信失敗を適切に処理する
- [ ] キュー管理がシステム過負荷を防止する
- [ ] ユーザーが通知スケジュールを変更できる
- [ ] デッドレターキューが永続的に失敗した通知をキャプチャする
- [ ] 高通知量下でパフォーマンスが安定している

### 検証コマンド

```bash
npm run test:notification-scheduling
npm run test:queue-management
npm run test:delivery-system
npm run monitor:queue-health
```

## 依存関係

- **必須**: PBI-4-1-1 - メールサービス統合
- **必須**: PBI-4-1-2 - 通知テンプレート
- **必須**: PBI-2-5-1 - pg-cronセットアップ（フェーズ2から）

## テスト要件

- Unit Tests (Vitest): スケジューリングロジック、キュー管理、再試行メカニズム
- Integration Tests (Testing Library): エンドツーエンド通知フロー
- Load Tests: 高負荷下でのキューパフォーマンス
- E2E Tests (Playwright): 完全なスケジューリングと配信ワークフロー

### テストカバレッジ要件

- スケジューリングロジック: 100%
- キュー管理: 95%
- 再試行メカニズム: 100%
- エラーハンドリング: 95%

## 見積もり

1 ストーリーポイント

## 優先度

高 - 通知システムのコア機能

## 実装ノート

- グローバルユーザー向けの適切なタイムゾーン処理を実装
- スケジューリング操作にデータベーストランザクションを使用
- キューヘルス用の包括的な監視とアラートを追加
- 外部サービスが利用できない場合のグレースフル劣化を確保
- 外部サービス呼び出し用サーキットブレーカーパターンを実装
