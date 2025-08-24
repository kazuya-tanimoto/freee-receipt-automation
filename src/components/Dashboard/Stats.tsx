import type { DashboardStats } from '../../types/dashboard'

/**
 * ダッシュボード統計表示コンポーネント
 * レシート処理状況の基本統計を表示
 */
interface StatsProps {
  stats: DashboardStats
}

export function Stats({ stats }: StatsProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '未処理'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">処理済み</h3>
        <p className="text-2xl font-bold text-green-600">{stats.totalProcessed}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">未処理</h3>
        <p className="text-2xl font-bold text-orange-600">{stats.totalPending}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">成功率</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">最終処理</h3>
        <p className="text-sm font-medium text-gray-900">{formatDate(stats.lastProcessed)}</p>
      </div>
    </div>
  )
}
