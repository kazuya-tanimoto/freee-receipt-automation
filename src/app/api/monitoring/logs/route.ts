import { getExecutionHistory } from '@/lib/monitoring'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * 実行ログ一覧を取得するAPI
 * GET /api/monitoring/logs?limit=50&status=completed
 *
 * @param request リクエストオブジェクト
 * @returns 実行ログ一覧
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Number.parseInt(limitParam) : 50
    const status = searchParams.get('status')

    // 実行履歴を取得
    const logs = await getExecutionHistory(limit)

    // ステータスフィルタが指定されている場合
    const filteredLogs = status ? logs.filter((log) => log.status === status) : logs

    return NextResponse.json(filteredLogs)
  } catch (error) {
    console.error('監視ログ取得エラー:', error)
    return NextResponse.json({ error: '監視ログの取得に失敗しました' }, { status: 500 })
  }
}
