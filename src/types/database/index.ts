/**
 * PBI-1-1-4: RLS and Types Setup - Unified Database Types Export
 * 
 * This file provides a centralized export for all database-related types,
 * combining Supabase auto-generated types with custom application types.
 */

// Export Supabase generated types first
export type { Database, Tables, TablesInsert, TablesUpdate } from "../supabase";

// Export core table types
export type {
  UserSettings,
  UserSettingsInsert,
  UserSettingsUpdate,
  Receipt,
  ReceiptInsert,
  ReceiptUpdate,
  ReceiptStatus,
} from "./core";

// Export transaction table types
export type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  ProcessingLog,
  ProcessingLogInsert,
  MatchingStatus,
  ProcessType,
  ProcessStatus,
  TransactionFilters,
  ProcessingLogFilters,
} from "./transactions";

// Import Database type for use in helper types
import type { Database } from "../supabase";

// Helper types for common database operations
export type DatabaseInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type DatabaseUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type DatabaseRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Type aliases for commonly used table names
export type TableName = keyof Database["public"]["Tables"];

// Union type for all possible table insert operations
export type AnyTableInsert = 
  | Database["public"]["Tables"]["user_settings"]["Insert"]
  | Database["public"]["Tables"]["receipts"]["Insert"];

// Union type for all possible table update operations
export type AnyTableUpdate = 
  | Database["public"]["Tables"]["user_settings"]["Update"]
  | Database["public"]["Tables"]["receipts"]["Update"];

// Utility type for extracting foreign key relationships
export type ForeignKeyUser = {
  user_id: string;
};

// Common filter patterns used across the application
export interface BaseFilters {
  user_id?: string;
  created_at_from?: string;
  created_at_to?: string;
  limit?: number;
  offset?: number;
}

// Extended filters for paginated queries
export interface PaginatedFilters extends BaseFilters {
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

/**
 * Type guards for runtime type checking
 */
export function isReceiptStatus(status: string): status is "pending" | "processing" | "completed" | "failed" {
  return ['pending', 'processing', 'completed', 'failed'].includes(status);
}

export function isMatchingStatus(status: string): status is "unmatched" | "auto_matched" | "manual_matched" | "rejected" {
  return ['unmatched', 'auto_matched', 'manual_matched', 'rejected'].includes(status);
}

export function isProcessType(type: string): type is "ocr" | "freee_sync" | "matching" | "notification" | "cleanup" {
  return ['ocr', 'freee_sync', 'matching', 'notification', 'cleanup'].includes(type);
}

export function isProcessStatus(status: string): status is "started" | "completed" | "failed" | "cancelled" {
  return ['started', 'completed', 'failed', 'cancelled'].includes(status);
}

/**
 * Utility types for RLS policy enforcement
 */
export interface RLSContext {
  user_id: string;
  is_authenticated: boolean;
}

// Type for database operations that require RLS context
export interface SecureOperation<T> {
  data: T;
  context: RLSContext;
}