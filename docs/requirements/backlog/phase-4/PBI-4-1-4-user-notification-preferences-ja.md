# PBI-4-1-4: ユーザー通知設定管理

## 説明

ユーザーが通知タイプ、配信スケジュール、通信チャネルを設定できる
包括的なユーザー通知設定システムを、リアルタイム更新とプロフィール統合とともに実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/app/(dashboard)/settings/notifications/page.tsx` - 通知設定ページ
2. `src/components/settings/NotificationPreferences.tsx` - 設定フォームコンポーネント
3. `src/components/settings/ScheduleSelector.tsx` - スケジュール設定コンポーネント
4. `src/lib/preferences/types.ts` - 設定型定義
5. `src/services/preferences/PreferencesService.ts` - 設定管理サービス
6. `src/hooks/useNotificationPreferences.ts` - 設定用Reactフック
7. `src/api/preferences/notifications.ts` - 設定用APIエンドポイント
8. `src/database/migrations/user-preferences.sql` - ユーザー設定テーブル

### 技術要件

- フェーズ3設定UIコンポーネントとの統合
- リアルタイム設定検証とプレビュー
- タイムゾーン対応スケジュール設定
- 設定の継承とデフォルト
- 一括設定操作
- 設定のインポート/エクスポート機能
- 設定UX用A/Bテストサポート

### 設定システムアーキテクチャ

```typescript
interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    address: string;
    verified: boolean;
  };
  notifications: {
    processingSummary: {
      enabled: boolean;
      frequency: "weekly" | "biweekly" | "monthly";
      dayOfWeek: number; // 0-6
      hour: number; // 0-23
      timezone: string;
    };
    errorAlerts: {
      enabled: boolean;
      severity: ("low" | "medium" | "high" | "critical")[];
      immediateDelivery: boolean;
    };
    actionRequired: {
      enabled: boolean;
      immediateDelivery: boolean;
      reminderInterval: number; // 時間
      maxReminders: number;
    };
  };
  globalSettings: {
    doNotDisturb: {
      enabled: boolean;
      startTime: string; // HH:mm
      endTime: string; // HH:mm
      timezone: string;
    };
    consolidation: {
      enabled: boolean;
      windowMinutes: number;
    };
  };
}

interface PreferencesService {
  getPreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<boolean>;
  resetToDefaults(userId: string): Promise<NotificationPreferences>;
  validatePreferences(
    preferences: NotificationPreferences,
  ): Promise<ValidationResult>;
  previewSchedule(
    preferences: NotificationPreferences,
  ): Promise<SchedulePreview>;
}
```

### UIコンポーネント仕様

- フェーズ3のshadcn/uiフォームコンポーネント使用
- リアルタイムスケジュールプレビュー実装
- 自動検出付きタイムゾーンセレクター追加
- 設定検証フィードバック含有
- 一括有効/無効操作サポート
- モバイル設定アクセス用レスポンシブデザイン

### データベーススキーマ

```sql
CREATE TABLE user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  email_address TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  processing_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  processing_summary_frequency TEXT NOT NULL DEFAULT 'weekly',
  processing_summary_day_of_week INTEGER NOT NULL DEFAULT 1,
  processing_summary_hour INTEGER NOT NULL DEFAULT 9,
  error_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  error_alerts_severity TEXT[] NOT NULL DEFAULT ARRAY['high', 'critical'],
  action_required_enabled BOOLEAN NOT NULL DEFAULT true,
  action_required_immediate BOOLEAN NOT NULL DEFAULT true,
  dnd_enabled BOOLEAN NOT NULL DEFAULT false,
  dnd_start_time TIME,
  dnd_end_time TIME,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 状態管理統合

- フェーズ3のZustandストアとの統合
- 設定キャッシュ用React Query使用
- UI応答性のためのオプティミスティック更新実装
- 複数ブラウザタブ間のリアルタイム同期

### セキュリティ考慮事項

- メールアドレス検証ワークフロー
- 設定アクセス用ユーザー権限検証
- 設定更新操作のレート制限
- タイムゾーンとスケジュールデータの安全な取り扱い

### パフォーマンス最適化

- TTL付き設定キャッシュ
- タイムゾーンデータの遅延読み込み
- デバウンス設定更新
- 適切なインデックス付き効率的なデータベースクエリ

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー担当者**: 人間の開発者

## 受け入れ基準

- [ ] ユーザーが全通知タイプとスケジュールを設定できる
- [ ] 自動検出付きタイムゾーン選択が正しく機能する
- [ ] メール検証ワークフローが適切に機能する
- [ ] サイレント時間設定が尊重される
- [ ] スケジュールプレビューが正確なタイミングを表示する
- [ ] 設定が保存され即座に適用される
- [ ] 設定UIが直感的でレスポンシブである
- [ ] 複数設定の一括操作が機能する

### 検証コマンド

```bash
npm run test:notification-preferences
npm run test:preference-ui
npm run test:timezone-handling
```

## 依存関係

- **必須**: PBI-3-6-1 - ユーザー設定（フェーズ3から）
- **必須**: PBI-4-1-1 - メールサービス統合
- **必須**: PBI-4-1-3 - 通知スケジューリングシステム

## テスト要件

- Unit Tests (Vitest): 設定検証、タイムゾーン処理、サービス機能
- Integration Tests (Testing Library): 設定フォーム操作、設定更新
- E2E Tests (Playwright): 完全な設定設定ワークフロー
- Accessibility Tests: 設定フォームのアクセシビリティとキーボードナビゲーション

### テストカバレッジ要件

- 設定検証: 100%
- 設定UI操作: 95%
- タイムゾーン処理: 100%
- データベース操作: 95%

## 見積もり

1 ストーリーポイント

## 優先度

中 - ユーザーエクスペリエンスに重要だが通知基盤の上に構築

## 実装ノート

- 高度な設定の段階的開示を実装
- 複雑な設定には役立つツールチップと説明を追加
- タイムゾーン変更とサマータイムの適切な処理を確保
- ユーザーの場所と行動に基づく適切なデフォルトを提供
- 将来の更新用設定移行ロジックを含める
