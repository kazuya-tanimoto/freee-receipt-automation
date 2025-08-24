'use client'

import type { FreeeTransaction } from '@/lib/freee-transactions'
import type { ReceiptProcessingData } from '@/types/dashboard'
import { useState } from 'react'

/**
 * 修正データの型定義
 */
interface CorrectionData {
  receiptId: string
  correctedAmount?: number
  correctedDate?: Date
  correctedVendor?: string
  selectedTransactionId?: number
  notes?: string
}

/**
 * 修正フォームのプロパティ
 */
interface CorrectionFormProps {
  /** レシート処理データ */
  receipt: ReceiptProcessingData
  /** 利用可能な取引一覧 */
  availableTransactions: FreeeTransaction[]
  /** 保存処理のコールバック */
  onSave: (data: CorrectionData) => Promise<void>
}

/**
 * レシート情報修正フォームコンポーネント
 * OCR・マッチング結果の手動修正機能を提供
 */
export default function CorrectionForm({
  receipt,
  availableTransactions,
  onSave,
}: CorrectionFormProps) {
  const [correctedAmount, setCorrectedAmount] = useState<number | ''>('')
  const [correctedDate, setCorrectedDate] = useState('')
  const [correctedVendor, setCorrectedVendor] = useState('')
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const correctionData: CorrectionData = {
        receiptId: receipt.id,
        correctedAmount: correctedAmount === '' ? undefined : Number(correctedAmount),
        correctedDate: correctedDate ? new Date(correctedDate) : undefined,
        correctedVendor: correctedVendor || undefined,
        selectedTransactionId:
          selectedTransactionId === '' ? undefined : Number(selectedTransactionId),
        notes: notes || undefined,
      }

      await onSave(correctionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">レシート情報修正</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 金額修正 */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            金額
          </label>
          <input
            type="number"
            id="amount"
            min="0"
            step="1"
            placeholder={receipt.matchResult?.amount?.toString() || '未設定'}
            value={correctedAmount}
            onChange={(e) =>
              setCorrectedAmount(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 日付修正 */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            取引日
          </label>
          <input
            type="date"
            id="date"
            value={correctedDate}
            onChange={(e) => setCorrectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 店舗名修正 */}
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
            取引先名
          </label>
          <input
            type="text"
            id="vendor"
            placeholder={receipt.matchResult?.partner || '未設定'}
            value={correctedVendor}
            onChange={(e) => setCorrectedVendor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 取引選択 */}
        <div>
          <label htmlFor="transaction" className="block text-sm font-medium text-gray-700 mb-1">
            対応取引
          </label>
          <select
            id="transaction"
            value={selectedTransactionId}
            onChange={(e) =>
              setSelectedTransactionId(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">取引を選択してください</option>
            {availableTransactions.map((transaction) => (
              <option key={transaction.id} value={transaction.id}>
                {transaction.date} - {transaction.description} (¥
                {transaction.amount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* 備考 */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="修正の理由や補足情報を入力"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '修正内容を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
