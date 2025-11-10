import { type NextRequest, NextResponse } from 'next/server'
import { getReceiptById } from '@/lib/supabase-helpers'

/**
 * レシート詳細API
 * GET /api/receipt/[id] - レシート詳細情報を取得
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'レシートIDが指定されていません' }, { status: 400 })
    }

    const data = await getReceiptById(id)

    if (!data) {
      return NextResponse.json({ error: 'レシートが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Receipt API error:', error)
    return NextResponse.json({ error: 'レシート情報の取得に失敗しました' }, { status: 500 })
  }
}
