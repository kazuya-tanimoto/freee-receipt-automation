/**
 * Supabase データベース操作ヘルパー関数
 * レシート処理データのCRUD操作を提供
 */

import { supabase } from './supabase'
import type {
  DashboardStats,
  ProcessedReceipt,
  ReceiptProcessingData,
} from '../types/dashboard'

/**
 * ダッシュボード統計情報を取得
 * @returns DashboardStats 統計情報
 */
export async function getReceiptStats(): Promise<DashboardStats> {
  // 処理済み数をカウント
  const { count: totalProcessed } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'success')

  // 未処理数をカウント
  const { count: totalPending } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'failed'])

  // 全体数をカウント
  const { count: total } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })

  // 成功率を計算
  const successRate =
    total && total > 0 && totalProcessed ? (totalProcessed / total) * 100 : 0

  // 最終処理日時を取得
  const { data: lastReceipt } = await supabase
    .from('receipts')
    .select('processed_at')
    .order('processed_at', { ascending: false })
    .limit(1)
    .single()

  return {
    totalProcessed: totalProcessed || 0,
    totalPending: totalPending || 0,
    successRate: Number.parseFloat(successRate.toFixed(1)),
    lastProcessed: lastReceipt?.processed_at
      ? new Date(lastReceipt.processed_at)
      : undefined,
  }
}

/**
 * 最近のレシート一覧を取得
 * @param limit 取得件数（デフォルト: 10）
 * @returns ProcessedReceipt[] レシート一覧
 */
export async function getRecentReceipts(limit = 10): Promise<ProcessedReceipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('id, filename, amount, status, processed_at')
    .order('processed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('レシート一覧取得エラー:', error)
    throw new Error(`レシート一覧の取得に失敗しました: ${error.message}`)
  }

  return (
    data?.map((row) => ({
      id: row.id,
      filename: row.filename,
      amount: row.amount || undefined,
      status: row.status as 'success' | 'pending' | 'failed',
      processedAt: new Date(row.processed_at),
    })) || []
  )
}

/**
 * レシート詳細情報を取得
 * @param id レシートID
 * @returns ReceiptProcessingData レシート処理データ
 */
export async function getReceiptById(id: string): Promise<ReceiptProcessingData | null> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('レシート詳細取得エラー:', error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    filename: data.filename,
    currentStatus: {
      step: data.current_step || 'ocr',
      status: data.current_status || 'pending',
      message: data.status_message || undefined,
      progress: data.progress || undefined,
    },
    ocrResult: data.ocr_text
      ? {
          text: data.ocr_text,
          confidence: data.ocr_confidence || 0,
        }
      : undefined,
    matchResult: data.match_partner
      ? {
          partner: data.match_partner,
          amount: data.match_amount || undefined,
          account: data.match_account || undefined,
          confidence: data.match_confidence || 0,
        }
      : undefined,
    registrationResult:
      data.registration_success !== null
        ? {
            transactionId: data.freee_transaction_id || undefined,
            success: data.registration_success,
            error: data.registration_error || undefined,
          }
        : undefined,
  }
}

/**
 * レシート修正データを保存
 * @param id レシートID
 * @param correctionData 修正データ
 */
export async function saveReceiptCorrection(
  id: string,
  correctionData: {
    amount?: number
    partner?: string
    account?: string
  }
): Promise<void> {
  const { error } = await supabase
    .from('receipts')
    .update({
      match_amount: correctionData.amount,
      match_partner: correctionData.partner,
      match_account: correctionData.account,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('レシート修正保存エラー:', error)
    throw new Error(`修正データの保存に失敗しました: ${error.message}`)
  }

  // 処理ログにも記録
  await supabase.from('processing_logs').insert({
    receipt_id: id,
    step: 'correction',
    status: 'success',
    message: '手動修正が適用されました',
  })
}

/**
 * レシート処理ステータスを取得
 * @param id レシートID
 * @returns 処理ステータス情報
 */
export async function getReceiptStatus(id: string) {
  const { data, error } = await supabase
    .from('receipts')
    .select('current_step, current_status, status_message, progress')
    .eq('id', id)
    .single()

  if (error) {
    console.error('ステータス取得エラー:', error)
    return null
  }

  return {
    step: data.current_step || 'ocr',
    status: data.current_status || 'pending',
    message: data.status_message || undefined,
    progress: data.progress || undefined,
  }
}

/**
 * OAuth認証トークンを保存
 * @param service サービス名
 * @param tokens トークン情報
 */
export async function saveAuthToken(
  service: 'gmail' | 'freee' | 'google_drive',
  tokens: {
    accessToken: string
    refreshToken?: string
    expiresAt?: Date
  }
): Promise<void> {
  const { error } = await supabase.from('auth_tokens').upsert(
    {
      service,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken || null,
      expires_at: tokens.expiresAt?.toISOString() || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'service',
    }
  )

  if (error) {
    console.error('トークン保存エラー:', error)
    throw new Error(`トークンの保存に失敗しました: ${error.message}`)
  }
}

/**
 * OAuth認証トークンを取得
 * @param service サービス名
 * @returns トークン情報
 */
export async function getAuthToken(service: 'gmail' | 'freee' | 'google_drive') {
  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('service', service)
    .single()

  if (error) {
    console.error('トークン取得エラー:', error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || undefined,
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
  }
}
