import type { ReceiptProcessingData } from '@/types/dashboard'
import { type NextRequest, NextResponse } from 'next/server'

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

    // TODO: 実際のデータベースまたはストレージからデータを取得
    // 現在はモックデータを返す
    const mockData: ReceiptProcessingData = {
      id,
      filename: `receipt_${id}.pdf`,
      currentStatus: {
        step: 'matching',
        status: 'processing',
        message: 'freee科目との照合中...',
        progress: 75,
      },
      ocrResult: {
        text: 'スターバックス コーヒー\n2024/01/15\n合計 ¥450',
        confidence: 0.95,
      },
      matchResult: {
        partner: 'スターバックス',
        amount: 450,
        account: '会議費',
        confidence: 0.88,
      },
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Receipt API error:', error)
    return NextResponse.json({ error: 'レシート情報の取得に失敗しました' }, { status: 500 })
  }
}
