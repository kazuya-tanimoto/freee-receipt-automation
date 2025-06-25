# PBI-2-3-6: Track間連携統合

## 説明

Track間のシームレスな通信とワークフローオーケストレーションを実現するTrack間連携機能を実装します。既存のprocessing_logsテーブルを活用したイベント駆動型の連携、後続Trackの起動メカニズムの実装、異なる処理Track間での確実なデータ受け渡しを含みます。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/drive/track-coordinator.ts` - Track連携マネージャー
2. `src/lib/drive/events/track-events.ts` - イベント定義と型
3. `src/lib/drive/events/event-publisher.ts` - イベント発行ロジック
4. `src/lib/drive/events/track-trigger.ts` - 次Track起動実装
5. `src/lib/drive/processing-log-integration.ts` - Processing logs統合
6. `src/types/track-coordination.ts` - Track連携の共有型
7. `supabase/migrations/010_add_track_coordination_columns.sql` - DBスキーマ更新
8. `docs/architecture/track-coordination.md` - アーキテクチャドキュメント

### 技術要件

- 既存のprocessing_logsテーブルとの統合によるイベント記録
- イベント駆動型Track起動メカニズムの実装
- Track間でのデータペイロード受け渡し対応
- 連携失敗時の適切なフォールバック処理
- 冪等性のあるTrack起動の保証
- Track実行チェーンのステータス監視
- 同期・非同期両方の連携パターンのサポート

### 実装コード

#### イベント型とインターフェース

```typescript
// src/types/track-coordination.ts
export interface TrackEvent {
  trackId: string;
  eventType: 'started' | 'completed' | 'failed' | 'data_ready';
  payload: Record<string, any>;
  metadata: {
    timestamp: Date;
    correlationId: string;
    sourceTrack: string;
    targetTracks?: string[];
  };
}

export interface TrackCoordinationConfig {
  trackDependencies: Map<string, string[]>;
  eventHandlers: Map<string, EventHandler>;
  retryPolicy: RetryPolicy;
  timeoutMs: number;
}
```

#### Processing Log統合

```typescript
// src/lib/drive/processing-log-integration.ts
export class ProcessingLogIntegration {
  async recordTrackEvent(
    userId: string,
    trackId: string,
    eventType: string,
    details: any
  ): Promise<void>;
  
  async getTrackExecutionChain(
    correlationId: string
  ): Promise<TrackExecutionRecord[]>;
  
  async checkTrackDependenciesMet(
    trackId: string,
    correlationId: string
  ): Promise<boolean>;
}
```

#### Trackトリガー実装

```typescript
// src/lib/drive/events/track-trigger.ts
export class TrackTrigger {
  async triggerNextTrack(
    currentTrack: string,
    completionData: any
  ): Promise<void>;
  
  async handleTrackFailure(
    trackId: string,
    error: Error,
    correlationId: string
  ): Promise<void>;
}
```

## メタデータ

- **ステータス**: 未着手
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-01-23
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]

## 受け入れ基準

- [ ] processing_logsテーブルにTrackイベントが記録される
- [ ] 完了時に次のTrackが自動的に起動される
- [ ] Track間でデータが正常に受け渡される
- [ ] Track連携の失敗が適切に処理される
- [ ] 循環依存が防止される
- [ ] Track実行チェーンが追跡可能
- [ ] 定義されたすべてのTrackワークフローで連携が機能する

### 検証コマンド

```bash
# Track連携のテスト
yarn test:track-coordination

# イベント発行の検証
yarn test:event-publisher

# processing logs統合の確認
yarn test:processing-logs

# エンドツーエンドTrackワークフローテスト
yarn test:e2e:track-workflow
```

## 依存関係

- **必須**: PBI-2-3-1 - Drive OAuth設定
- **必須**: PBI-2-3-2 - Drive基本API操作
- **必須**: PBI-2-3-3 - Driveビジネスロジック統合
- **必須**: PBI-2-5-1 - pg_cron設定（スケジュール連携用）
- **必須**: PBI-2-5-2 - バックグラウンドジョブキュー（非同期処理用）
- **必須**: Phase 1の既存processing_logsテーブル

## テスト要件

- 単体テスト: イベント発行・処理ロジック
- 統合テスト: 完全なTrack連携シナリオ
- 性能テスト: 大量イベント処理
- 障害テスト: ネットワーク障害、タイムアウトシナリオ
- エンドツーエンドテスト: 完全なマルチTrackワークフロー

### テストシナリオ

1. **正常系**: Gmail → Drive → File Management → freee
2. **障害復旧**: 自動リトライを伴うTrack障害
3. **タイムアウト処理**: 長時間実行Trackのタイムアウト
4. **並行実行**: 複数の相関IDの同時実行
5. **データ整合性**: Track間でのデータ一貫性の検証

## 見積もり

2ストーリーポイント

## 優先度

高 - マルチTrackワークフロー自動化に必須

## 実装メモ

- Phase 1の既存processing_logsテーブル構造を活用
- システム仕様のDatabase-Driven Event Architectureパターンに従う
- pg_cronスケジュールワークフローとの互換性を確保
- Track障害に対するサーキットブレーカーの実装を検討
- イベントキューの深さを監視してオーバーフロー防止
- エンドツーエンドトレーシング用の相関IDを実装
- プッシュ（イベント駆動）とプル（ポーリング）両モデルをサポート
- Track依存関係グラフを明確にドキュメント化
- Track実行タイムアウトの実装を検討
- 完了した連携データの適切なクリーンアップを確保
