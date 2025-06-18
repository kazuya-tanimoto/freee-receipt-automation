# PBI-3-2-1: ダッシュボード統計概要

## 概要

領収書処理メトリクス、取引マッチング率、システムパフォーマンス指標を示す主要統計カードを含むメインダッシュボードページを作成。

## 実装詳細

### 作成・変更するファイル

1. `src/app/(dashboard)/page.tsx` - メインダッシュボードページ
2. `src/components/dashboard/StatsOverview.tsx` - 統計カードコンテナ
3. `src/components/dashboard/StatCard.tsx` - 個別統計カード
4. `src/lib/dashboard/stats.ts` - 統計計算関数
5. `src/hooks/useDashboardStats.ts` - 統計データ取得フック
6. `src/components/ui/skeleton.tsx` - ローディングスケルトンコンポーネント

### 技術要件

- 自動更新付きSupabaseからのリアルタイム統計
- パーセンテージ変化計算とトレンドインジケーター
- スケルトンUI付きローディング状態
- データ取得失敗のエラーハンドリング
- 統計カード用レスポンシブグリッドレイアウト
- 大規模データセット用パフォーマンス最適化

### データベースクエリ

```sql
-- 領収書処理統計
SELECT
  COUNT(*) as total_receipts,
  COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed_receipts,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_receipts,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_receipts
FROM receipts
WHERE created_at >= NOW() - INTERVAL '30 days';

-- 取引マッチング統計
SELECT
  COUNT(*) as total_matches,
  AVG(match_confidence) as avg_confidence,
  COUNT(CASE WHEN match_confidence > 0.8 THEN 1 END) as high_confidence_matches
FROM receipt_transactions;
```

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント
- **レビュー者**: 人間開発者

## 受け入れ基準

- [ ] ダッシュボードが正確な領収書処理統計を表示
- [ ] 取引マッチングメトリクスが正しく計算される
- [ ] 統計カードが前期間からのパーセンテージ変化を表示
- [ ] データ取得中にローディング状態を表示
- [ ] エラー状態がネットワーク障害を適切に処理
- [ ] 新しいデータが利用可能時に統計が自動更新
- [ ] カードがレスポンシブでアクセシブル

### 検証コマンド

```bash
npm run test:dashboard
npm run test:stats
npm run test:responsive
```

## 依存関係

- **必須**: PBI-3-1-5 - アプリケーションレイアウト（ダッシュボードコンテナ）
- **必須**: PBI-3-1-2 - Supabaseクライアント（データ取得）
- **必須**: Phase 1 - 領収書・取引データベーススキーマ

## テスト要件

- データ精度: 統計計算が正しいことを検証
- リアルタイム更新: 自動データ更新をテスト
- パフォーマンス: 大規模データセット（10,000+レコード）でテスト

## 見積もり

1ストーリーポイント

## 優先度

高 - システム監視の主要インターフェース

## 実装メモ

- 効率的なデータキャッシュと更新のためReact Queryを使用
- 最終コンテンツにマッチする適切なローディングスケルトンを実装
- 前期間データを使用してパーセンテージ変化を計算
- 統計用カスタマイズ可能な時間範囲の実装を検討
- 適切な障害処理のためエラー境界を追加
