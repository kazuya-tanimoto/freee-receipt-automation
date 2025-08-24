/** レシート・取引マッチングロジック */

import type { FreeeTransaction } from '@/lib/freee-transactions'
import type { ParsedReceiptData } from '@/lib/text-parser'

/**
 * マッチング結果
 */
export interface MatchResult {
  transaction: FreeeTransaction
  receipt: ParsedReceiptData
  score: number
  matchType: 'exact' | 'approximate' | 'partial'
}

/**
 * マッチング基準設定
 */
export interface MatchingCriteria {
  amountTolerance: number
  dateTolerance: number
  minimumScore: number
}

/**
 * レシート・取引マッチャーインターフェース
 */
export interface ReceiptMatcher {
  findMatches(receipt: ParsedReceiptData, transactions: FreeeTransaction[]): MatchResult[]
  calculateScore(receipt: ParsedReceiptData, transaction: FreeeTransaction): number
}

/**
 * デフォルトマッチング基準
 */
const DEFAULT_CRITERIA: MatchingCriteria = {
  amountTolerance: 0.05, // 5%許容
  dateTolerance: 3, // ±3日
  minimumScore: 0.3,
}

/**
 * レシート・取引マッチング実装クラス
 */
export class ReceiptTransactionMatcher implements ReceiptMatcher {
  private criteria: MatchingCriteria

  constructor(criteria: MatchingCriteria = DEFAULT_CRITERIA) {
    this.criteria = criteria
  }

  /**
   * レシートに対する取引候補を検索
   */
  findMatches(receipt: ParsedReceiptData, transactions: FreeeTransaction[]): MatchResult[] {
    if (!receipt.amount || !receipt.date) {
      return []
    }

    const results: MatchResult[] = []

    for (const transaction of transactions) {
      const score = this.calculateScore(receipt, transaction)
      if (score >= this.criteria.minimumScore) {
        const matchType = this.determineMatchType(receipt, transaction, score)
        results.push({
          transaction,
          receipt,
          score,
          matchType,
        })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * レシートと取引の類似度スコア計算
   */
  calculateScore(receipt: ParsedReceiptData, transaction: FreeeTransaction): number {
    let totalScore = 0
    let factors = 0

    // 金額マッチング (重要度: 0.6)
    if (receipt.amount && transaction.amount) {
      const amountScore = this.calculateAmountScore(receipt.amount, transaction.amount)
      totalScore += amountScore * 0.6
      factors += 0.6
    }

    // 日付マッチング (重要度: 0.4)
    if (receipt.date) {
      const dateScore = this.calculateDateScore(receipt.date, new Date(transaction.date))
      totalScore += dateScore * 0.4
      factors += 0.4
    }

    return factors > 0 ? totalScore / factors : 0
  }

  private calculateAmountScore(receiptAmount: number, transactionAmount: number): number {
    if (receiptAmount === transactionAmount) return 1.0

    const difference = Math.abs(receiptAmount - transactionAmount)
    const tolerance = transactionAmount * this.criteria.amountTolerance

    if (difference <= tolerance) {
      return 1.0 - (difference / tolerance) * 0.2 // 許容範囲内で0.8-1.0
    }

    // 許容範囲外は指数的減衰
    const ratio = difference / transactionAmount
    return Math.max(0, 1.0 - (ratio * 2) ** 2)
  }

  private calculateDateScore(receiptDate: Date, transactionDate: Date): number {
    const dayDiff = Math.abs(
      Math.floor((receiptDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24))
    )

    if (dayDiff === 0) return 1.0
    if (dayDiff <= this.criteria.dateTolerance) {
      return 1.0 - (dayDiff / this.criteria.dateTolerance) * 0.3 // 許容範囲内で0.7-1.0
    }

    // 許容範囲外は線形減衰
    return Math.max(0, 0.7 - (dayDiff - this.criteria.dateTolerance) * 0.1)
  }

  private determineMatchType(
    receipt: ParsedReceiptData,
    transaction: FreeeTransaction,
    score: number
  ): 'exact' | 'approximate' | 'partial' {
    if (score >= 0.9) return 'exact'
    if (score >= 0.7) return 'approximate'
    return 'partial'
  }
}

/**
 * デフォルトマッチャーインスタンス
 */
export const defaultReceiptMatcher = new ReceiptTransactionMatcher()

/**
 * レシートマッチング関数（簡単アクセス用）
 */
export function findReceiptMatches(
  receipt: ParsedReceiptData,
  transactions: FreeeTransaction[],
  criteria?: MatchingCriteria
): MatchResult[] {
  const matcher = criteria ? new ReceiptTransactionMatcher(criteria) : defaultReceiptMatcher
  return matcher.findMatches(receipt, transactions)
}
