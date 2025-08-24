import StatusDisplay from '@/components/Receipt/StatusDisplay'
import type { ReceiptProcessingData } from '@/types/dashboard'
import { notFound } from 'next/navigation'

/**
 * レシート詳細ページ
 * 個別レシートの処理状況と結果を表示
 */
interface ReceiptDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const { id } = await params

  // レシートデータを取得
  let data: ReceiptProcessingData
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/receipt/${id}`,
      {
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      if (response.status === 404) notFound()
      throw new Error('レシートデータの取得に失敗しました')
    }

    data = await response.json()
  } catch (error) {
    console.error('Receipt fetch error:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h1 className="text-lg font-semibold text-red-800">エラー</h1>
            <p className="text-red-600">レシート情報の取得に失敗しました</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">レシート詳細</h1>
          <p className="text-gray-600">{data.filename}</p>
        </div>

        <StatusDisplay data={data} />
      </div>
    </div>
  )
}
