import { describe, it, expect } from 'vitest'
import type { UserSettings, Receipt, ReceiptStatus } from './core'
import type { Transaction, ProcessingLog, MatchingStatus, ProcessType } from './transactions'

describe('Database Types', () => {
  describe('Core Types', () => {
    it('should define UserSettings interface correctly', () => {
      const userSettings: UserSettings = {
        id: 'test-uuid',
        freee_company_id: 'company-123',
        notification_email: 'test@example.com',
        notification_preferences: { email: true, sms: false },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(userSettings.id).toBe('test-uuid')
      expect(userSettings.freee_company_id).toBe('company-123')
      expect(userSettings.notification_email).toBe('test@example.com')
      expect(typeof userSettings.notification_preferences).toBe('object')
    })

    it('should allow null values for optional fields', () => {
      const userSettings: UserSettings = {
        id: 'test-uuid',
        freee_company_id: null,
        notification_email: null,
        notification_preferences: {},
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(userSettings.freee_company_id).toBeNull()
      expect(userSettings.notification_email).toBeNull()
    })

    it('should define Receipt interface correctly', () => {
      const receipt: Receipt = {
        id: 'receipt-uuid',
        user_id: 'user-uuid',
        file_name: 'receipt.pdf',
        file_path: '/uploads/receipt.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        ocr_text: 'Receipt content',
        ocr_data: { amount: 100, vendor: 'Test Store' },
        processed_at: '2023-01-01T00:00:00Z',
        status: 'completed' as ReceiptStatus,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(receipt.id).toBe('receipt-uuid')
      expect(receipt.user_id).toBe('user-uuid')
      expect(receipt.status).toBe('completed')
      expect(typeof receipt.ocr_data).toBe('object')
    })
  })

  describe('Transaction Types', () => {
    it('should define Transaction interface correctly', () => {
      const transaction: Transaction = {
        id: 'transaction-uuid',
        user_id: 'user-uuid',
        freee_transaction_id: 'freee-123',
        amount: 1000.50,
        date: '2023-01-01',
        description: 'Test transaction',
        category: 'office supplies',
        account_item_id: 123,
        matched_receipt_id: 'receipt-uuid',
        matching_confidence: 0.95,
        matching_status: 'auto_matched' as MatchingStatus,
        freee_data: { original: 'data' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(transaction.amount).toBe(1000.50)
      expect(transaction.matching_confidence).toBe(0.95)
      expect(transaction.matching_status).toBe('auto_matched')
    })

    it('should define ProcessingLog interface correctly', () => {
      const log: ProcessingLog = {
        id: 'log-uuid',
        user_id: 'user-uuid',
        process_type: 'ocr' as ProcessType,
        status: 'completed',
        details: { pages: 1, confidence: 0.8 },
        error_message: null,
        duration_ms: 1500,
        related_receipt_id: 'receipt-uuid',
        related_transaction_id: null,
        created_at: '2023-01-01T00:00:00Z'
      }

      expect(log.process_type).toBe('ocr')
      expect(log.duration_ms).toBe(1500)
      expect(typeof log.details).toBe('object')
    })
  })

  describe('Type Safety', () => {
    it('should enforce matching status values', () => {
      const validStatuses: MatchingStatus[] = [
        'unmatched',
        'auto_matched', 
        'manual_matched',
        'rejected'
      ]

      validStatuses.forEach(status => {
        const transaction: Partial<Transaction> = {
          matching_status: status
        }
        expect(transaction.matching_status).toBe(status)
      })
    })

    it('should enforce process type values', () => {
      const validTypes: ProcessType[] = [
        'ocr',
        'freee_sync',
        'matching',
        'notification',
        'cleanup'
      ]

      validTypes.forEach(type => {
        const log: Partial<ProcessingLog> = {
          process_type: type
        }
        expect(log.process_type).toBe(type)
      })
    })

    it('should enforce receipt status values', () => {
      const validStatuses: ReceiptStatus[] = [
        'pending',
        'processing',
        'completed',
        'failed'
      ]

      validStatuses.forEach(status => {
        const receipt: Partial<Receipt> = {
          status: status
        }
        expect(receipt.status).toBe(status)
      })
    })
  })
})