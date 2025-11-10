import { NextResponse } from 'next/server'
import { getReceiptStats } from '../../../../lib/supabase-helpers'

/**
 * ダッシュボード統計情報を取得する
 * GET /api/dashboard/stats
 *
 * @returns DashboardStats レシート処理統計情報
 */
export async function GET() {
  try {
    const stats = await getReceiptStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('統計取得エラー:', error)

    return NextResponse.json({ error: '統計情報の取得に失敗しました' }, { status: 500 })
  }
}
