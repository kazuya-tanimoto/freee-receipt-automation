// このファイルは自動生成されます。手動で編集しないでください。
// @generated

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string
          freee_company_id: string | null
          notification_email: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          freee_company_id?: string | null
          notification_email?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          freee_company_id?: string | null
          notification_email?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          ocr_text: string | null
          ocr_data: Json | null
          processed_at: string | null
          status: "pending" | "processing" | "completed" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          ocr_text?: string | null
          ocr_data?: Json | null
          processed_at?: string | null
          status?: "pending" | "processing" | "completed" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          ocr_text?: string | null
          ocr_data?: Json | null
          processed_at?: string | null
          status?: "pending" | "processing" | "completed" | "failed"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          freee_transaction_id: string | null
          amount: number
          date: string
          description: string
          category: string | null
          account_item_id: number | null
          matched_receipt_id: string | null
          matching_confidence: number | null
          matching_status: "unmatched" | "auto_matched" | "manual_matched" | "rejected"
          freee_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          freee_transaction_id?: string | null
          amount: number
          date: string
          description: string
          category?: string | null
          account_item_id?: number | null
          matched_receipt_id?: string | null
          matching_confidence?: number | null
          matching_status?: "unmatched" | "auto_matched" | "manual_matched" | "rejected"
          freee_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          freee_transaction_id?: string | null
          amount?: number
          date?: string
          description?: string
          category?: string | null
          account_item_id?: number | null
          matched_receipt_id?: string | null
          matching_confidence?: number | null
          matching_status?: "unmatched" | "auto_matched" | "manual_matched" | "rejected"
          freee_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_matched_receipt_id_fkey"
            columns: ["matched_receipt_id"]
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          }
        ]
      }
      processing_logs: {
        Row: {
          id: string
          user_id: string
          process_type: "ocr" | "freee_sync" | "matching" | "notification" | "cleanup"
          status: "started" | "completed" | "failed" | "cancelled"
          details: Json
          error_message: string | null
          duration_ms: number | null
          related_receipt_id: string | null
          related_transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          process_type: "ocr" | "freee_sync" | "matching" | "notification" | "cleanup"
          status: "started" | "completed" | "failed" | "cancelled"
          details: Json
          error_message?: string | null
          duration_ms?: number | null
          related_receipt_id?: string | null
          related_transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          process_type?: "ocr" | "freee_sync" | "matching" | "notification" | "cleanup"
          status?: "started" | "completed" | "failed" | "cancelled"
          details?: Json
          error_message?: string | null
          duration_ms?: number | null
          related_receipt_id?: string | null
          related_transaction_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_logs_related_receipt_id_fkey"
            columns: ["related_receipt_id"]
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_logs_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never