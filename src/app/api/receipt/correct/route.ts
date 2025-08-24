import { type NextRequest, NextResponse } from 'next/server'

/**
 * レシート修正データ保存API
 * POST /api/receipt/correct - 修正内容を保存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 基本的なバリデーション
    if (!body.receiptId) {
      return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 })
    }

    // TODO: 実際のデータベース保存処理
    // - 修正データをSupabaseに保存
    // - 元のレシート処理データと関連付け
    // - 修正履歴の記録

    return NextResponse.json({
      success: true,
      id: `correction_${Date.now()}`,
      message: 'Correction saved successfully',
    })
  } catch (error) {
    console.error('Correction save error:', error)
    return NextResponse.json({ error: 'Failed to save correction' }, { status: 500 })
  }
}
