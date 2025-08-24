import { completeExecution, getExecutionHistory, startExecution } from '@/lib/monitoring'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase client
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createServerClient: () => ({
    from: mockFrom.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate.mockReturnValue({
        eq: mockEq,
      }),
      select: mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({
          limit: mockLimit,
        }),
      }),
    }),
  }),
}))

describe('Monitoring Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate.mockReturnValue({ eq: mockEq }),
      select: mockSelect.mockReturnValue({
        order: mockOrder.mockReturnValue({ limit: mockLimit }),
      }),
    })
  })

  describe('startExecution', () => {
    it('実行開始を記録する', async () => {
      mockInsert.mockResolvedValue({ data: null, error: null })

      const executionId = await startExecution()

      expect(executionId).toBeDefined()
      expect(mockFrom).toHaveBeenCalledWith('execution_logs')
      expect(mockInsert).toHaveBeenCalledWith({
        id: expect.any(String),
        execution_id: executionId,
        started_at: expect.any(String),
        status: 'running',
        processed_count: 0,
        error_count: 0,
      })
    })
  })

  describe('completeExecution', () => {
    it('実行完了を記録する（成功）', async () => {
      const executionId = 'test-execution-id'
      mockEq.mockResolvedValue({ data: null, error: null })

      await completeExecution(executionId, 5, 0)

      expect(mockFrom).toHaveBeenCalledWith('execution_logs')
      expect(mockUpdate).toHaveBeenCalledWith({
        completed_at: expect.any(String),
        status: 'completed',
        processed_count: 5,
        error_count: 0,
        errors: undefined,
      })
      expect(mockEq).toHaveBeenCalledWith('execution_id', executionId)
    })

    it('実行完了を記録する（失敗）', async () => {
      const executionId = 'test-execution-id'
      const errors = ['エラー1', 'エラー2']
      mockEq.mockResolvedValue({ data: null, error: null })

      await completeExecution(executionId, 3, 2, errors)

      expect(mockUpdate).toHaveBeenCalledWith({
        completed_at: expect.any(String),
        status: 'failed',
        processed_count: 3,
        error_count: 2,
        errors,
      })
    })
  })

  describe('getExecutionHistory', () => {
    it('実行履歴を取得する', async () => {
      const mockData = [
        {
          id: '1',
          execution_id: 'exec-1',
          started_at: '2025-08-24T10:00:00Z',
          completed_at: '2025-08-24T10:05:00Z',
          status: 'completed',
          processed_count: 5,
          error_count: 0,
          errors: null,
        },
      ]
      mockLimit.mockResolvedValue({ data: mockData, error: null })

      const result = await getExecutionHistory(10)

      expect(mockFrom).toHaveBeenCalledWith('execution_logs')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('started_at', { ascending: false })
      expect(mockLimit).toHaveBeenCalledWith(10)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        executionId: 'exec-1',
        startedAt: new Date('2025-08-24T10:00:00Z'),
        completedAt: new Date('2025-08-24T10:05:00Z'),
        status: 'completed',
        processedCount: 5,
        errorCount: 0,
        errors: null,
      })
    })

    it('空の結果を適切に処理する', async () => {
      mockLimit.mockResolvedValue({ data: null, error: null })

      const result = await getExecutionHistory()

      expect(result).toEqual([])
    })
  })
})
