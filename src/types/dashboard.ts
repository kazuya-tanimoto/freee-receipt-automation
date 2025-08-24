/**
 * Dashboard統計情報の型定義
 * レシート処理状況を表示するための基本統計
 */
export interface DashboardStats {
  /** 処理済みレシート数 */
  totalProcessed: number
  /** 未処理レシート数 */
  totalPending: number
  /** 成功率（%） */
  successRate: number
  /** 最後の処理日時 */
  lastProcessed?: Date
}

/**
 * ダッシュボードプロパティ
 * メインダッシュボードコンポーネントで使用
 */
export interface DashboardProps {
  /** 統計情報 */
  stats: DashboardStats
  /** 最近のレシート一覧 */
  recentReceipts: ProcessedReceipt[]
}

/**
 * 処理済みレシート情報
 * レシート一覧表示用の最小限の情報
 */
export interface ProcessedReceipt {
  /** レシートID */
  id: string
  /** ファイル名 */
  filename: string
  /** 金額（解析成功時のみ） */
  amount?: number
  /** 処理ステータス */
  status: 'success' | 'pending' | 'failed'
  /** 処理日時 */
  processedAt: Date
}
