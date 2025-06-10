# PBI-2-5-2: バックグラウンドジョブキュー実装コード

この実装はサイズ制約のため複数のファイルに分割されています：

## 実装ファイル

1. [PBI-2-5-2-database-schema.md](PBI-2-5-2-database-schema.md) - データベーススキーマとSQLマイグレーション
2. [PBI-2-5-2-queue-implementation.md](PBI-2-5-2-queue-implementation.md) - コアキュー実装
3. [PBI-2-5-2-job-processor.md](PBI-2-5-2-job-processor.md) - ジョブプロセッサーとワーカー実装
4. [PBI-2-5-2-retry-policy.md](PBI-2-5-2-retry-policy.md) - リトライポリシーとインターフェース仕様

## 概要

この実装は、レシートを非同期で処理するための堅牢なバックグラウンドジョブキューシステムを提供します。
システムには以下が含まれます：

- 優先度サポート付きデータベースバックアップジョブキュー
- 指数バックオフ付きリトライメカニズム
- 異なるジョブタイプのサポート（メール、OCR、マッチング等）
- 設定可能なワーカーによる並行ジョブ処理
- 失敗したジョブ用のデッドレターキュー
- リソース使用量の監視とスロットリング

## 主要コンポーネント

### ジョブタイプ

- `PROCESS_EMAIL_RECEIPT` - メールレシートの処理
- `PROCESS_OCR` - ドキュメントのOCR処理
- `MATCH_TRANSACTION` - レシートと取引のマッチング
- `ORGANIZE_FILE` - ドライブ内のファイル整理
- `SYNC_FREEE` - freee APIとの同期
- `GENERATE_REPORT` - レポート生成

### ジョブステータス

- `PENDING` - ジョブは処理待ち
- `PROCESSING` - ジョブは現在処理中
- `COMPLETED` - ジョブは正常に完了
- `FAILED` - ジョブは失敗したがリトライ可能
- `CANCELLED` - ジョブはキャンセルされた
- `DEAD_LETTER` - ジョブは永続的に失敗

## 使用例

```typescript
// ジョブキューの初期化
const queue = new JobQueue(supabaseClient, logger);

// 単一ジョブのエンキュー
const jobId = await queue.enqueue(
  JobType.PROCESS_EMAIL_RECEIPT,
  { email_id: "123", user_id: "456" },
  { priority: 1 },
);

// ジョブプロセッサーの開始
const processor = new JobProcessor(queue, handlers, logger, {
  maxWorkers: 4,
  pollInterval: 5000,
  jobTypes: [JobType.PROCESS_EMAIL_RECEIPT],
});

await processor.start();
```
