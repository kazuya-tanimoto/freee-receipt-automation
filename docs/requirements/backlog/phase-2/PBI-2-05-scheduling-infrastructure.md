# PBI-2-05: スケジューリング基盤（pg_cron設定）

## 説明

PostgreSQLのpg_cron拡張を使用して、週次自動実行のスケジューリング基盤を構築します。Edge Functionを定期的に呼び出すためのデータベースレベルのスケジュール設定と管理機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `supabase/migrations/001_pg_cron_setup.sql` - pg_cron設定（25行以内）

### 技術要件

- PostgreSQL pg_cron拡張
- Supabase Database Functions
- SQLによるスケジュール管理

### インターフェース仕様

```sql
-- スケジュール設定
CREATE TABLE IF NOT EXISTS processing_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT UNIQUE NOT NULL,
  cron_expression TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- cron job設定
SELECT cron.schedule(
  'weekly-receipt-processing',
  '0 9 * * 1', -- 毎週月曜9時
  $$SELECT net.http_post(...)$$
);
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-04完了後に実施
- [x] **依存関係確認**: Edge Function（PBI-2-04）が前提
- [x] **spec要件確認**: 週次自動実行の基盤
- [x] **リソース確認**: Supabase pg_cron利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: SQL設定25行以内
- **単一責任**: スケジュール設定のみ
- **直接実装**: シンプルなcron設定

### コード品質基準
- **SQL**: 明確なテーブル定義とcron設定
- **コメント**: 各設定の説明を記載
- **エラー処理**: 設定失敗時の考慮

## 受け入れ基準

- [ ] pg_cronが有効化される
- [ ] 週次スケジュールが設定される
- [ ] スケジュールの有効/無効が切り替え可能
- [ ] SQLエラーがない

### 検証コマンド

```bash
# TypeScript検証
npx tsc --noEmit

# Lintチェック（Biome）
npm run lint

# テスト実行（Vitest）
npm run test

# マイグレーション実行
supabase db push

# pg_cron設定確認
# Supabaseダッシュボードでcron jobsを確認
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: データベース設定のみ
- [ ] **要件達成**: 週次スケジュール設定完了
- [ ] **シンプル化**: 最小限のcron設定
- [ ] **テスト**: スケジュール動作確認
- [ ] **設定確認**: pg_cron正常動作

### 第三者視点コードレビュー観点
- [ ] **可読性**: SQL設定が明確
- [ ] **保守性**: スケジュール変更が容易
- [ ] **信頼性**: cronジョブの確実な実行
- [ ] **安全性**: 適切な権限設定

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- SQL: ✅ エラーなし / ❌ Xエラー
- 設定: ✅ pg_cron有効化 / ❌ 設定失敗
- スケジュール: ✅ 正常登録 / ❌ 登録失敗
- 影響範囲: ✅ DB設定のみ

### 実装サマリー
- **達成した価値**: 自動実行の基盤構築
- **主要な実装**: pg_cronによる週次スケジュール
- **残課題**: なし
- **次PBIへの引き継ぎ**: スケジュール基盤が利用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-08-02
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]