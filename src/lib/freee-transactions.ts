import type { FreeeTokens } from '@/types/config'

/**
 * freee transaction data structure
 */
export interface FreeeTransaction {
  id: number
  date: string
  amount: number
  description: string
  status: 'pending' | 'settled' | 'transferred'
  receipt_ids: number[]
}

/**
 * Transaction query parameters for filtering
 */
export interface TransactionQuery {
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

/**
 * freee transaction API interface
 */
export interface FreeeTransactionAPI {
  getTransactions(query?: TransactionQuery): Promise<FreeeTransaction[]>
  getUnprocessedTransactions(): Promise<FreeeTransaction[]>
}

/**
 * freee API deal response structure
 */
interface FreeeDeal {
  id: number
  issue_date?: string
  due_date?: string
  amount?: number
  partner_name?: string
  status: string
  receipt_ids?: number[]
  details?: Array<{ account_item_name?: string }>
}

/**
 * freee API service for transaction data retrieval
 */
export class FreeeTransactionService implements FreeeTransactionAPI {
  private tokens: FreeeTokens
  private baseUrl = 'https://api.freee.co.jp/api/1'

  constructor(tokens: FreeeTokens) {
    this.tokens = tokens
  }

  /**
   * Get transactions from freee with optional filtering
   */
  async getTransactions(query?: TransactionQuery): Promise<FreeeTransaction[]> {
    const params = new URLSearchParams()

    if (query?.startDate) {
      params.append('start_date', query.startDate.toISOString().split('T')[0])
    }
    if (query?.endDate) {
      params.append('end_date', query.endDate.toISOString().split('T')[0])
    }

    const url = `${this.baseUrl}/deals?company_id=${this.tokens.company_id}&${params}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status}`)
    }

    const data = await response.json()
    const transactions = data.deals || []

    return transactions
      .map((deal: FreeeDeal) => this.mapDealToTransaction(deal))
      .filter((transaction: FreeeTransaction) => this.matchesQuery(transaction, query))
  }

  /**
   * Get unprocessed transactions (no receipts attached)
   */
  async getUnprocessedTransactions(): Promise<FreeeTransaction[]> {
    const transactions = await this.getTransactions()
    return transactions.filter((t) => t.receipt_ids.length === 0 && t.status === 'pending')
  }

  private mapDealToTransaction(deal: FreeeDeal): FreeeTransaction {
    return {
      id: deal.id,
      date: deal.issue_date || deal.due_date || new Date().toISOString().split('T')[0],
      amount: Math.abs(deal.amount || 0),
      description: deal.partner_name || deal.details?.[0]?.account_item_name || '',
      status: this.mapDealStatus(deal.status),
      receipt_ids: deal.receipt_ids || [],
    }
  }

  private mapDealStatus(status: string): 'pending' | 'settled' | 'transferred' {
    switch (status) {
      case 'settled':
        return 'settled'
      case 'transferred':
        return 'transferred'
      default:
        return 'pending'
    }
  }

  private matchesQuery(transaction: FreeeTransaction, query?: TransactionQuery): boolean {
    if (!query) return true

    if (query.minAmount && transaction.amount < query.minAmount) return false
    if (query.maxAmount && transaction.amount > query.maxAmount) return false

    return true
  }
}
