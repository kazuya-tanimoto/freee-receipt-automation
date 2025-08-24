import type { FreeeTransaction } from '@/lib/freee-transactions'
import {
  ReceiptTransactionMatcher,
  defaultReceiptMatcher,
  findReceiptMatches,
} from '@/lib/receipt-matcher'
import type { ParsedReceiptData } from '@/lib/text-parser'
import { describe, expect, it } from 'vitest'

describe('ReceiptTransactionMatcher', () => {
  const mockReceipt: ParsedReceiptData = {
    amount: 1000,
    date: new Date('2024-01-15'),
    vendor: 'Test Store',
    rawText: 'Test receipt text',
  }

  const mockTransactions: FreeeTransaction[] = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 1000,
      description: 'Store purchase',
      status: 'pending',
      receipt_ids: [],
    },
    {
      id: 2,
      date: '2024-01-14',
      amount: 1050,
      description: 'Similar amount',
      status: 'pending',
      receipt_ids: [],
    },
    {
      id: 3,
      date: '2024-01-20',
      amount: 2000,
      description: 'Different amount',
      status: 'pending',
      receipt_ids: [],
    },
  ]

  describe('findMatches', () => {
    it('完全一致の場合、exactマッチを返す', () => {
      const matcher = new ReceiptTransactionMatcher({
        amountTolerance: 0.05,
        dateTolerance: 3,
        minimumScore: 0.1,
      })
      const matches = matcher.findMatches(mockReceipt, mockTransactions)

      expect(matches).toHaveLength(3)
      expect(matches[0].matchType).toBe('exact')
      expect(matches[0].transaction.id).toBe(1)
      expect(matches[0].score).toBeCloseTo(1.0, 2)
    })

    it('金額・日付が未設定の場合、空配列を返す', () => {
      const matcher = new ReceiptTransactionMatcher()
      const invalidReceipt = { rawText: 'no amount or date' }
      const matches = matcher.findMatches(invalidReceipt, mockTransactions)

      expect(matches).toHaveLength(0)
    })

    it('スコア順に結果をソートして返す', () => {
      const matcher = new ReceiptTransactionMatcher({
        amountTolerance: 0.05,
        dateTolerance: 3,
        minimumScore: 0.1,
      })
      const matches = matcher.findMatches(mockReceipt, mockTransactions)

      expect(matches).toHaveLength(3)
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].score).toBeGreaterThanOrEqual(matches[i + 1].score)
      }
    })
  })

  describe('calculateScore', () => {
    it('完全一致の場合、スコア1.0を返す', () => {
      const matcher = new ReceiptTransactionMatcher()
      const score = matcher.calculateScore(mockReceipt, mockTransactions[0])

      expect(score).toBeCloseTo(1.0, 2)
    })

    it('金額が近似の場合、高いスコアを返す', () => {
      const matcher = new ReceiptTransactionMatcher()
      const score = matcher.calculateScore(mockReceipt, mockTransactions[1])

      expect(score).toBeGreaterThan(0.7)
      expect(score).toBeLessThan(1.0)
    })

    it('金額が大きく異なる場合、低いスコアを返す', () => {
      const matcher = new ReceiptTransactionMatcher()
      const score = matcher.calculateScore(mockReceipt, mockTransactions[2])

      expect(score).toBeLessThan(0.7)
    })
  })

  describe('matchType判定', () => {
    it('高スコア(≥0.9)でexactを判定', () => {
      const matcher = new ReceiptTransactionMatcher()
      const matches = matcher.findMatches(mockReceipt, [mockTransactions[0]])

      expect(matches[0].matchType).toBe('exact')
    })

    it('中スコア(≥0.7)でapproximateを判定', () => {
      const matcher = new ReceiptTransactionMatcher()
      const matches = matcher.findMatches(mockReceipt, [mockTransactions[1]])

      expect(matches[0].matchType).toBe('approximate')
    })

    it('低スコア(<0.7)でpartialを判定', () => {
      const matcher = new ReceiptTransactionMatcher({
        amountTolerance: 0.05,
        dateTolerance: 3,
        minimumScore: 0.1,
      })
      const matches = matcher.findMatches(mockReceipt, [mockTransactions[2]])

      expect(matches).toHaveLength(1)
      expect(matches[0].matchType).toBe('partial')
    })
  })

  describe('findReceiptMatches関数', () => {
    it('デフォルトマッチャーで正常動作', () => {
      const matches = findReceiptMatches(mockReceipt, mockTransactions)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('カスタム基準で正常動作', () => {
      const customCriteria = {
        amountTolerance: 0.1,
        dateTolerance: 5,
        minimumScore: 0.5,
      }
      const matches = findReceiptMatches(mockReceipt, mockTransactions, customCriteria)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
