# PBI-2-04: 週次自動実行

## 説明

pg_cronを使用して週次自動でレシート処理を実行する機能を実装します。Supabase Edge Functionsによるバックグラウンド処理、エラーハンドリング、実行ログ記録を含む最小限の自動化機能を提供します。

## 実装詳細

### 作成/修正するファイル

1. `supabase/functions/weekly-process/index.ts` - 週次処理Edge Function（95行以内）
2. `supabase/migrations/001_pg_cron_setup.sql` - pg_cron設定（25行以内）

### 技術要件

- Supabase Edge Functions
- pg_cron週次スケジュール
- エラーハンドリング
- 実行ログ記録

### インターフェース仕様

```typescript
interface WeeklyProcessingConfig {
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

interface ProcessingJob {
  id: string;
  startedAt: Date;
  status: 'running' | 'completed' | 'failed';
  processedCount: number;
  errorCount: number;
  errors?: string[];
}

interface WeeklyProcessor {
  runWeeklyProcess(): Promise<ProcessingJob>;
  getLastRun(): Promise<ProcessingJob | null>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-03完了後に実施、他への影響なし
- [x] **依存関係確認**: Phase 1全機能完了が前提
- [x] **spec要件確認**: 週次自動実行がspec必須要件
- [x] **リソース確認**: Supabase Edge Functions・pg_cronが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: Edge Function 95行、SQL設定25行以内
- **単一責任**: 自動実行のみ、複雑なワークフローは含まない
- **直接実装**: 複雑なジョブキューシステムは使用しない

### コード品質基準
- **TypeScript**: 型安全なバックグラウンド処理
- **エラーハンドリング**: 実行失敗時の適切な処理
- **JSDoc**: 自動実行関数の説明記載

## 受け入れ基準

- [ ] 週次スケジュールが正常に設定される
- [ ] Edge Functionが期待通りに実行される
- [ ] 実行ログが適切に記録される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
npx tsc --noEmit

# Edge Function テスト
supabase functions serve
# 手動でEdge Function呼び出し確認

# pg_cronテスト
# Supabaseダッシュボードでcron設定確認
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: 週次自動実行が完了している
- [ ] **シンプル化**: 必要最小限の自動化機能のみ
- [ ] **テスト**: 自動実行テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 自動実行コードが理解しやすい
- [ ] **保守性**: スケジュール変更が容易な設計
- [ ] **セキュリティ**: バックグラウンド処理が安全に実装されている
- [ ] **パフォーマンス**: 効率的な自動処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 自動実行テストパス / ❌ X失敗  
- ドキュメント: ✅ 自動実行機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシート処理の完全自動化が実現した
- **主要な実装**: Supabase Edge Functions + pg_cron自動実行システム
- **残課題**: なし
- **次PBIへの引き継ぎ**: 自動実行が通知機能で活用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]