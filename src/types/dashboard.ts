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

/**
 * 処理ステップ情報
 * 個別レシートの詳細処理状況を管理
 */
export interface ProcessingStatus {
  /** 処理ステップ */
  step: 'ocr' | 'parsing' | 'matching' | 'registration' | 'completed'
  /** 処理状態 */
  status: 'pending' | 'processing' | 'success' | 'failed'
  /** 状態メッセージ */
  message?: string
  /** 進捗率（0-100） */
  progress?: number
}

/**
 * OCR処理結果
 * テキスト抽出結果と信頼度
 */
export interface OCRResult {
  /** 抽出されたテキスト */
  text: string
  /** 抽出信頼度（0-1） */
  confidence: number
}

/**
 * マッチング結果
 * レシート情報とfreee科目の照合結果
 */
export interface MatchResult {
  /** 取引先名 */
  partner?: string
  /** 金額 */
  amount?: number
  /** 勘定科目 */
  account?: string
  /** マッチング信頼度（0-1） */
  confidence: number
}

/**
 * freee登録結果
 * 経費登録処理の結果情報
 */
export interface RegistrationResult {
  /** freee取引ID */
  transactionId?: string
  /** 登録成功フラグ */
  success: boolean
  /** エラーメッセージ */
  error?: string
}

/**
 * レシート処理データ
 * 個別レシートの全処理状況と結果
 */
export interface ReceiptProcessingData {
  /** レシートID */
  id: string
  /** ファイル名 */
  filename: string
  /** 現在の処理状況 */
  currentStatus: ProcessingStatus
  /** OCR結果 */
  ocrResult?: OCRResult
  /** マッチング結果 */
  matchResult?: MatchResult
  /** freee登録結果 */
  registrationResult?: RegistrationResult
}
