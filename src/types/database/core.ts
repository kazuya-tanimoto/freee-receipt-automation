/**
 * PBI-1-1-2: Core Tables TypeScript Types
 * 
 * TypeScript interfaces for core database tables:
 * - user_settings (extending Supabase auth.users)
 * - receipts (storing receipt information and OCR data)
 */

/**
 * User settings table interface
 * Extends Supabase auth.users with additional application-specific fields
 */
export interface UserSettings {
  /** UUID primary key referencing auth.users(id) */
  id: string;
  /** freee company ID for integration */
  freee_company_id: string | null;
  /** Email address for notifications */
  notification_email: string | null;
  /** JSON object containing notification preferences */
  notification_preferences: Record<string, any>;
  /** Timestamp when record was created */
  created_at: string;
  /** Timestamp when record was last updated */
  updated_at: string;
}

/**
 * Receipt processing status enum
 */
export type ReceiptStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Receipts table interface
 * Stores receipt files and OCR processing results
 */
export interface Receipt {
  /** UUID primary key */
  id: string;
  /** UUID foreign key referencing auth.users(id) */
  user_id: string;
  /** Original filename of the uploaded receipt */
  file_name: string;
  /** Storage path to the receipt file */
  file_path: string;
  /** File size in bytes */
  file_size: number | null;
  /** MIME type of the file */
  mime_type: string | null;
  /** Raw OCR text extracted from the receipt */
  ocr_text: string | null;
  /** Structured OCR data as JSON */
  ocr_data: Record<string, any> | null;
  /** Timestamp when OCR processing was completed */
  processed_at: string | null;
  /** Current processing status */
  status: ReceiptStatus;
  /** Timestamp when record was created */
  created_at: string;
  /** Timestamp when record was last updated */
  updated_at: string;
}

/**
 * Database insert types (omit auto-generated fields)
 */
export type UserSettingsInsert = Omit<UserSettings, 'created_at' | 'updated_at'>;
export type ReceiptInsert = Omit<Receipt, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

/**
 * Database update types (make all fields optional except id)
 */
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
export type ReceiptUpdate = Partial<Omit<Receipt, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;