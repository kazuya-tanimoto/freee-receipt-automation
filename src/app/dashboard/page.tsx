import { Stats } from '../../components/Dashboard/Stats'
import type { DashboardStats, ProcessedReceipt } from '../../types/dashboard'

/**
 * レシート処理状況を確認できるダッシュボードページ
 * 処理統計とレシート一覧を表示
 */
export default async function DashboardPage() {
  // API呼び出しでデータを取得
  const [stats, receipts] = await Promise.all([fetchStats(), fetchRecentReceipts(5)])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">レシート処理ダッシュボード</h1>

      <Stats stats={stats} />

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">最近のレシート</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{receipt.filename}</p>
                <p className="text-sm text-gray-500">
                  {new Date(receipt.processedAt).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {receipt.amount && (
                  <span className="text-sm font-medium text-gray-900">
                    ¥{receipt.amount.toLocaleString()}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    receipt.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : receipt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {receipt.status === 'success'
                    ? '完了'
                    : receipt.status === 'pending'
                      ? '処理中'
                      : '失敗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 統計情報を取得
 */
async function fetchStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard/stats`,
      {
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error('統計取得に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('統計取得エラー:', error)
    return { totalProcessed: 0, totalPending: 0, successRate: 0 }
  }
}

/**
 * 最近のレシート一覧を取得
 */
async function fetchRecentReceipts(limit = 10): Promise<ProcessedReceipt[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard/receipts?limit=${limit}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('レシート一覧取得に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('レシート一覧取得エラー:', error)
    return []
  }
}
