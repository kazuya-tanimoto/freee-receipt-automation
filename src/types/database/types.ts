/**
 * Type alias file - Re-exports from main database type modules
 * This file exists for backward compatibility with test files
 */

// Re-export everything from the main database types
export * from './index'
export type { Database } from '../supabase'

// Legacy type aliases for test compatibility
export type { ProcessType, ProcessStatus, MatchingStatus } from './transactions'
export type { ReceiptStatus } from './core'