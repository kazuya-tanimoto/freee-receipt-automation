/**
 * PBI-1-1-3: Transaction Tables TypeScript Types
 * 
 * TypeScript interfaces for transaction-related database tables:
 * - transactions (storing freee API data and matching information)
 * - processing_logs (tracking system operations and debugging)
 */

/**
 * Transaction matching status enum
 */
export type MatchingStatus = "unmatched" | "auto_matched" | "manual_matched" | "rejected";

/**
 * Processing log process type enum
 */
export type ProcessType = "ocr" | "freee_sync" | "matching" | "notification" | "cleanup";

/**
 * Processing log status enum
 */
export type ProcessStatus = "started" | "completed" | "failed" | "cancelled";

/**
 * Transactions table interface
 * Stores freee transaction data and receipt matching information
 */
export interface Transaction {
  /** UUID primary key */
  id: string;
  /** UUID foreign key referencing auth.users(id) */
  user_id: string;
  /** Unique freee transaction ID from API */
  freee_transaction_id: string | null;
  /** Transaction amount (using DECIMAL for precision) */
  amount: number;
  /** Transaction date */
  date: string;
  /** Transaction description */
  description: string;
  /** Transaction category */
  category: string | null;
  /** freee account item ID */
  account_item_id: number | null;
  /** UUID foreign key referencing receipts(id) */
  matched_receipt_id: string | null;
  /** Confidence score for automatic matching (0.0 to 1.0) */
  matching_confidence: number | null;
  /** Current matching status */
  matching_status: MatchingStatus;
  /** Original freee API response data as JSON */
  freee_data: Record<string, any> | null;
  /** Timestamp when record was created */
  created_at: string;
  /** Timestamp when record was last updated */
  updated_at: string;
}

/**
 * Processing logs table interface
 * Tracks system operations and debugging information
 */
export interface ProcessingLog {
  /** UUID primary key */
  id: string;
  /** UUID foreign key referencing auth.users(id) */
  user_id: string;
  /** Type of process being logged */
  process_type: ProcessType;
  /** Current status of the process */
  status: ProcessStatus;
  /** Additional process details as JSON */
  details: Record<string, any>;
  /** Error message if process failed */
  error_message: string | null;
  /** Process duration in milliseconds */
  duration_ms: number | null;
  /** UUID foreign key referencing receipts(id) */
  related_receipt_id: string | null;
  /** UUID foreign key referencing transactions(id) */
  related_transaction_id: string | null;
  /** Timestamp when record was created */
  created_at: string;
}

/**
 * Database insert types (omit auto-generated fields)
 */
export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ProcessingLogInsert = Omit<ProcessingLog, 'id' | 'created_at'> & {
  id?: string;
};

/**
 * Database update types (make all fields optional except id)
 */
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * Processing logs are typically append-only, so no update type needed
 * If updates are required in the future, uncomment the line below:
 */
// export type ProcessingLogUpdate = Partial<Omit<ProcessingLog, 'id' | 'user_id' | 'created_at'>>;

/**
 * Query helper types for common filtering operations
 */
export interface TransactionFilters {
  user_id?: string;
  date_from?: string;
  date_to?: string;
  matching_status?: MatchingStatus;
  matched_receipt_id?: string | null;
  category?: string;
}

export interface ProcessingLogFilters {
  user_id?: string;
  process_type?: ProcessType;
  status?: ProcessStatus;
  date_from?: string;
  date_to?: string;
  related_receipt_id?: string;
  related_transaction_id?: string;
}