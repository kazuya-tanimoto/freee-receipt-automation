import { NextResponse } from 'next/server'
import type { DashboardStats } from '../../../../types/dashboard'

/**
 * ダッシュボード統計情報を取得する
 * GET /api/dashboard/stats
 *
 * @returns DashboardStats レシート処理統計情報
 */
export async function GET() {
  try {
    // TODO: 実際のデータベースから統計を取得する実装に置き換え
    // Phase 1完了後に実データ連携を実装予定
    const mockStats: DashboardStats = {
      totalProcessed: 8,
      totalPending: 3,
      successRate: 72.7, // (8/11)*100
      lastProcessed: new Date('2025-08-24T10:30:00Z'),
    }

    return NextResponse.json(mockStats)
  } catch (error) {
    console.error('統計取得エラー:', error)

    return NextResponse.json({ error: '統計情報の取得に失敗しました' }, { status: 500 })
  }
}
