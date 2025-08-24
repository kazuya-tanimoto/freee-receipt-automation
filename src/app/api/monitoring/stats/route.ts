import { getExecutionHistory } from '@/lib/monitoring'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * 実行統計情報を取得するAPI
 * GET /api/monitoring/stats?period=weekly
 *
 * @param request リクエストオブジェクト
 * @returns 統計情報
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'

    // 実行履歴を取得
    const logs = await getExecutionHistory()

    // 基本統計を計算
    const totalRuns = logs.length
    const successful = logs.filter((log) => log.status === 'completed').length
    const successRate = totalRuns > 0 ? (successful / totalRuns) * 100 : 0

    // 平均実行時間を計算（完了したもののみ）
    const completedLogs = logs.filter((log) => log.completedAt && log.startedAt)
    const avgDuration =
      completedLogs.length > 0
        ? completedLogs.reduce((sum, log) => {
            const duration = (log.completedAt?.getTime() || 0) - log.startedAt.getTime()
            return sum + duration
          }, 0) / completedLogs.length
        : 0

    const stats = {
      totalRuns,
      successRate: Number.parseFloat(successRate.toFixed(2)),
      avgDuration: Number.parseFloat((avgDuration / 1000).toFixed(2)), // 秒単位に変換
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('統計取得エラー:', error)
    return NextResponse.json({ error: '統計情報の取得に失敗しました' }, { status: 500 })
  }
}
