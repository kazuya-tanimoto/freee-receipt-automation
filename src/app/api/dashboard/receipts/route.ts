import { type NextRequest, NextResponse } from 'next/server'
import { getRecentReceipts } from '../../../../lib/supabase-helpers'

/**
 * 最近のレシート一覧を取得する
 * GET /api/dashboard/receipts?limit=5
 *
 * @param request URLSearchParamsでlimitを指定可能
 * @returns ProcessedReceipt[] 処理済みレシート一覧
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 10

    const receipts = await getRecentReceipts(limit)

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('レシート一覧取得エラー:', error)

    return NextResponse.json({ error: 'レシート一覧の取得に失敗しました' }, { status: 500 })
  }
}
