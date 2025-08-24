import type { FreeeTokens } from '@/types/config'

/**
 * Expense registration data structure
 */
export interface ExpenseRegistration {
  transactionId: number
  amount: number
  date: Date
  description: string
  receiptFile?: Buffer
}

/**
 * Expense registration result
 */
export interface RegistrationResult {
  success: boolean
  expenseId?: number
  receiptId?: number
  error?: string
}

/**
 * freee expense API interface
 */
export interface FreeeExpenseAPI {
  registerExpense(data: ExpenseRegistration): Promise<RegistrationResult>
  uploadReceipt(expenseId: number, file: Buffer, filename: string): Promise<number>
}

/**
 * freee API service for expense registration and receipt upload
 */
export class FreeeExpenseService implements FreeeExpenseAPI {
  private tokens: FreeeTokens
  private baseUrl = 'https://api.freee.co.jp/api/1'

  constructor(tokens: FreeeTokens) {
    this.tokens = tokens
  }

  /**
   * Register expense to freee
   */
  async registerExpense(data: ExpenseRegistration): Promise<RegistrationResult> {
    try {
      const expensePayload = {
        company_id: this.tokens.company_id,
        title: data.description,
        issue_date: data.date.toISOString().split('T')[0],
        expense_application_lines: [
          {
            tax_code: 1,
            account_item_id: 1,
            amount: data.amount,
            description: data.description,
          },
        ],
      }

      const response = await fetch(`${this.baseUrl}/expense_applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expensePayload),
      })

      if (!response.ok) {
        throw new Error(`Expense registration failed: ${response.status}`)
      }

      const result = await response.json()
      const expenseId = result.expense_application?.id

      if (!expenseId) {
        throw new Error('No expense ID returned')
      }

      let receiptId: number | undefined
      if (data.receiptFile) {
        receiptId = await this.uploadReceipt(expenseId, data.receiptFile, 'receipt.pdf')
      }

      return { success: true, expenseId, receiptId }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Upload receipt file to freee
   */
  async uploadReceipt(expenseId: number, file: Buffer, filename: string): Promise<number> {
    const formData = new FormData()
    formData.append('company_id', this.tokens.company_id.toString())
    formData.append('receipt', new Blob([new Uint8Array(file)]), filename)

    const response = await fetch(`${this.baseUrl}/receipts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Receipt upload failed: ${response.status}`)
    }

    const result = await response.json()
    return result.receipt?.id || 0
  }
}
