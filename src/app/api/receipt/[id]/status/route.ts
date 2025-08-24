import type { ProcessingStatus } from '@/types/dashboard'
import { type NextRequest, NextResponse } from 'next/server'

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

    // TODO: 実際のジョブキューまたはタスク管理システムから現在の状況を取得
    // 現在はモックデータを返す
    const mockStatus: ProcessingStatus = {
      step: 'matching',
      status: 'processing',
      message: 'freee科目との照合中...',
      progress: 75,
    }

    // リアルタイム更新のためのヘッダー設定
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }

    return NextResponse.json(mockStatus, { headers })
  } catch (error) {
    console.error('Receipt status API error:', error)
    return NextResponse.json({ error: '処理状況の取得に失敗しました' }, { status: 500 })
  }
}
