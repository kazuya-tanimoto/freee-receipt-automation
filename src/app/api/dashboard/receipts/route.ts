import { type NextRequest, NextResponse } from 'next/server'
import type { ProcessedReceipt } from '../../../../types/dashboard'

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

    // TODO: 実際のデータベースからレシート情報を取得する実装に置き換え
    // Phase 1完了後に実データ連携を実装予定
    const mockReceipts: ProcessedReceipt[] = [
      {
        id: 'receipt-001',
        filename: 'コンビニレシート_20250824.pdf',
        amount: 1200,
        status: 'success',
        processedAt: new Date('2025-08-24T10:30:00Z'),
      },
      {
        id: 'receipt-002',
        filename: '交通費レシート_20250823.pdf',
        amount: 340,
        status: 'success',
        processedAt: new Date('2025-08-23T15:45:00Z'),
      },
      {
        id: 'receipt-003',
        filename: '飲食レシート_20250823.pdf',
        status: 'pending',
        processedAt: new Date('2025-08-23T12:20:00Z'),
      },
      {
        id: 'receipt-004',
        filename: '備品購入レシート_20250822.pdf',
        status: 'failed',
        processedAt: new Date('2025-08-22T09:15:00Z'),
      },
    ]

    // limit数に応じて切り取り
    const receipts = mockReceipts.slice(0, limit)

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('レシート一覧取得エラー:', error)

    return NextResponse.json({ error: 'レシート一覧の取得に失敗しました' }, { status: 500 })
  }
}
