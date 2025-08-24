import { createServerClient } from './supabase'

export interface ExecutionLog {
  id: string
  executionId: string
  startedAt: Date
  completedAt?: Date
  status: 'running' | 'completed' | 'failed'
  processedCount: number
  errorCount: number
  errors?: string[]
}

export async function startExecution(): Promise<string> {
  const executionId = crypto.randomUUID()
  const supabase = createServerClient()
  await supabase.from('execution_logs').insert({
    id: crypto.randomUUID(),
    execution_id: executionId,
    started_at: new Date().toISOString(),
    status: 'running',
    processed_count: 0,
    error_count: 0,
  })
  return executionId
}

export async function completeExecution(
  executionId: string,
  processedCount: number,
  errorCount: number,
  errors?: string[]
): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('execution_logs')
    .update({
      completed_at: new Date().toISOString(),
      status: errorCount > 0 ? 'failed' : 'completed',
      processed_count: processedCount,
      error_count: errorCount,
      errors,
    })
    .eq('execution_id', executionId)
}

export async function getExecutionHistory(limit = 50): Promise<ExecutionLog[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('execution_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (
    data?.map((log) => ({
      id: log.id,
      executionId: log.execution_id,
      startedAt: new Date(log.started_at),
      completedAt: log.completed_at ? new Date(log.completed_at) : undefined,
      status: log.status,
      processedCount: log.processed_count,
      errorCount: log.error_count,
      errors: log.errors,
    })) || []
  )
}
