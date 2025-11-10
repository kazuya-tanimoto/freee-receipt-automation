import { type NextRequest, NextResponse } from 'next/server'
import { saveReceiptCorrection } from '@/lib/supabase-helpers'

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

    await saveReceiptCorrection(body.receiptId, {
      amount: body.amount,
      partner: body.partner,
      account: body.account,
    })

    return NextResponse.json({
      success: true,
      message: 'Correction saved successfully',
    })
  } catch (error) {
    console.error('Correction save error:', error)
    return NextResponse.json({ error: 'Failed to save correction' }, { status: 500 })
  }
}
