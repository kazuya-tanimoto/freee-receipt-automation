import { type NextRequest, NextResponse } from 'next/server'
import { getReceiptStatus } from '@/lib/supabase-helpers'

/**
 * レシート処理状況API
 * GET /api/receipt/[id]/status - リアルタイム処理状況を取得
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'レシートIDが指定されていません' }, { status: 400 })
    }

    const status = await getReceiptStatus(id)

    if (!status) {
      return NextResponse.json({ error: 'レシートが見つかりません' }, { status: 404 })
    }

    // リアルタイム更新のためのヘッダー設定
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }

    return NextResponse.json(status, { headers })
  } catch (error) {
    console.error('Receipt status API error:', error)
    return NextResponse.json({ error: '処理状況の取得に失敗しました' }, { status: 500 })
  }
}
