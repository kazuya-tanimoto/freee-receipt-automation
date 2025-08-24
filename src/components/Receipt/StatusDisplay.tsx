'use client'

import type { ProcessingStatus, ReceiptProcessingData } from '@/types/dashboard'

/**
 * レシート処理状況表示コンポーネント
 * ステップ表示とリアルタイム状況更新を行う
 */
interface StatusDisplayProps {
  /** レシート処理データ */
  data: ReceiptProcessingData
  /** 更新間隔（ミリ秒） */
  refreshInterval?: number
}

export default function StatusDisplay({ data, refreshInterval = 5000 }: StatusDisplayProps) {
  const steps = [
    { key: 'ocr', label: 'OCR処理', description: 'テキスト抽出' },
    { key: 'parsing', label: '解析', description: 'データ解析' },
    { key: 'matching', label: 'マッチング', description: 'freee科目照合' },
    { key: 'registration', label: '登録', description: 'freee経費登録' },
    { key: 'completed', label: '完了', description: '処理完了' },
  ] as const

  const getStepStatus = (stepKey: string) => {
    if (stepKey === data.currentStatus.step) return data.currentStatus.status
    const stepIndex = steps.findIndex((s) => s.key === stepKey)
    const currentIndex = steps.findIndex((s) => s.key === data.currentStatus.step)
    return stepIndex < currentIndex ? 'success' : 'pending'
  }

  const getStatusColor = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'success':
        return '✓'
      case 'processing':
        return '⟳'
      case 'failed':
        return '✗'
      default:
        return '○'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">処理状況</h2>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key)
            const isActive = step.key === data.currentStatus.step

            return (
              <div key={step.key} className="flex items-center space-x-4">
                <div
                  className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                  ${getStatusColor(status)}
                `}
                >
                  {getStatusIcon(status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{step.label}</h3>
                    {isActive && data.currentStatus.progress && (
                      <span className="text-sm text-gray-500">{data.currentStatus.progress}%</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {isActive && data.currentStatus.message && (
                    <p className="text-sm text-blue-600 mt-1">{data.currentStatus.message}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 結果詳細表示 */}
      {data.ocrResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-2">OCR結果</h3>
          <p className="text-sm text-gray-600 mb-2">
            信頼度: {(data.ocrResult.confidence * 100).toFixed(1)}%
          </p>
          <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-32">
            {data.ocrResult.text}
          </pre>
        </div>
      )}

      {data.matchResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-2">マッチング結果</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>取引先: {data.matchResult.partner || '未設定'}</div>
            <div>
              金額:{' '}
              {data.matchResult.amount ? `¥${data.matchResult.amount.toLocaleString()}` : '未設定'}
            </div>
            <div>勘定科目: {data.matchResult.account || '未設定'}</div>
            <div>信頼度: {(data.matchResult.confidence * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  )
}
