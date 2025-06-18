# PBI-5-1-6: 修正データ可視化UI

## 説明

チャート、グラフ、ダッシュボードビューを含む修正データ可視化のユーザーインターフェースコンポーネントを実装します。ユーザーの修正パターンとシステム学習進捗の洞察を提供します。

## 実装詳細

### 作成/修正ファイル

1. `src/components/analytics/CorrectionDashboard.tsx` - メインダッシュボードコンポーネント
2. `src/components/analytics/CorrectionChart.tsx` - チャート可視化コンポーネント
3. `src/components/analytics/StatisticsPanel.tsx` - 統計表示パネル
4. `src/lib/charts/chart-config.ts` - チャート設定とスタイリング
5. `src/app/dashboard/analytics/page.tsx` - 分析ページルート

### 技術要件

- Chart.jsまたは類似ライブラリを使用したインタラクティブチャート
- リアルタイムデータ更新とフィルタリング
- モバイル・デスクトップ対応のレスポンシブデザイン
- チャートとデータのエクスポート機能
- WCAGガイドラインに準拠したアクセシブルUIコンポーネント

### UIアーキテクチャ

```typescript
interface CorrectionDashboardProps {
  userId: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

interface CorrectionChartProps {
  data: ChartData;
  type: ChartType;
  title: string;
  height?: number;
  onDataPointClick?: (point: DataPoint) => void;
}

interface StatisticsPanelProps {
  statistics: CorrectionStatistics;
  loading?: boolean;
  className?: string;
}
```

### チャートタイプ

```typescript
type ChartType = 'line' | 'bar' | 'doughnut' | 'area';

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
}
```

## 受け入れ基準

- [ ] 折れ線グラフで時系列修正トレンドを表示
- [ ] 円・ドーナツグラフで修正タイプ分布を表示
- [ ] 読みやすいパネルで統計を表示
- [ ] インタラクティブフィルタリングと時間範囲選択をサポート
- [ ] チャートとデータのエクスポート機能を提供
- [ ] デバイス間でレスポンシブデザインを確保

## 依存関係

- **必須**: PBI-5-1-4 (修正分析)
- **必須**: PBI-3-1-3 (基本UIコンポーネント)

## テスト要件

- 単体テスト: コンポーネントレンダリングとインタラクション
- 統合テスト: データ取得とチャート更新
- ビジュアルテスト: チャート外観とレスポンシブ性

## 見積もり

1 ストーリーポイント

## 優先度

中 - ユーザーエクスペリエンスと洞察を向上

## 実装メモ

- ページルーティングにはNext.js App Routerを使用
- チャートデータのクライアントサイドキャッシュを実装
- React-nativeチャートにはRechartsの使用を検討
