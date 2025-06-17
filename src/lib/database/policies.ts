/**
 * PBI-1-1-4: RLS Policy Helper Functions
 * 
 * This module provides helper functions for working with Row Level Security (RLS)
 * policies in the freee receipt automation system. These functions encapsulate
 * common patterns for user-scoped database operations.
 */

import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserSettings,
  Receipt,
  Transaction,
  ProcessingLog,
  RLSContext,
  SecureOperation,
} from '@/types/database';

/**
 * RLS Policy Error Codes
 */
export type RLSPolicyErrorCode = 'AUTH_REQUIRED' | 'PERMISSION_DENIED' | 'VALIDATION_FAILED';

/**
 * Error thrown when RLS policy validation fails
 */
export class RLSPolicyError extends Error {
  public readonly code: RLSPolicyErrorCode;

  constructor(
    message: string,
    code: RLSPolicyErrorCode,
    public readonly context?: RLSContext
  ) {
    super(message);
    this.name = 'RLSPolicyError';
    this.code = code;
  }
}

/**
 * Maximum limits for pagination to prevent DoS attacks
 */
const PAGINATION_LIMITS = {
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10,
} as const;

/**
 * Validates that a user context is properly authenticated
 */
export function validateUserContext(context: RLSContext): void {
  if (!context.is_authenticated) {
    throw new RLSPolicyError('User must be authenticated', 'AUTH_REQUIRED', context);
  }
  
  if (!context.user_id) {
    throw new RLSPolicyError('User ID is required', 'VALIDATION_FAILED', context);
  }
}

/**
 * Creates a Supabase client with RLS context for server-side operations
 */
export function createSecureClient(context: RLSContext): SupabaseClient<Database> {
  validateUserContext(context);
  
  // For server-side operations, we need to set the user context
  return createClient() as SupabaseClient<Database>;
}

/**
 * Helper function to ensure operations are performed with proper user context
 */
export function withUserContext<T>(
  operation: SecureOperation<T>,
  handler: (data: T, context: RLSContext) => Promise<any>
) {
  validateUserContext(operation.context);
  return handler(operation.data, operation.context);
}

/**
 * User Settings Policy Helpers
 */
export const userSettingsPolicies = {
  /**
   * Checks if a user can access their own settings
   */
  canAccessSettings(userId: string, context: RLSContext): boolean {
    return context.is_authenticated && context.user_id === userId;
  },

  /**
   * Validates user settings operation
   */
  validateSettingsOperation(userId: string, context: RLSContext): void {
    if (!this.canAccessSettings(userId, context)) {
      throw new RLSPolicyError(
        `User ${context.user_id} cannot access settings for user ${userId}`,
        'PERMISSION_DENIED',
        context
      );
    }
  },

  /**
   * Securely fetch user settings
   */
  async fetchUserSettings(context: RLSContext): Promise<UserSettings | null> {
    validateUserContext(context);
    
    const supabaseClient = createSecureClient(context);
    const { data, error } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('id', context.user_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new RLSPolicyError(`Failed to fetch user settings: ${error.message}`, 'VALIDATION_FAILED', context);
    }

    // Type conversion for notification_preferences with proper typing
    return data ? {
      ...data,
      notification_preferences: data.notification_preferences as UserSettings['notification_preferences']
    } as UserSettings : null;
  },
};

/**
 * Receipt Policy Helpers
 */
export const receiptPolicies = {
  /**
   * Checks if a user can access a specific receipt
   */
  canAccessReceipt(receiptUserId: string, context: RLSContext): boolean {
    return context.is_authenticated && context.user_id === receiptUserId;
  },

  /**
   * Validates receipt operation
   */
  validateReceiptOperation(receiptUserId: string, context: RLSContext): void {
    if (!this.canAccessReceipt(receiptUserId, context)) {
      throw new RLSPolicyError(
        `User ${context.user_id} cannot access receipt owned by user ${receiptUserId}`,
        'PERMISSION_DENIED',
        context
      );
    }
  },

  /**
   * Securely fetch user receipts with pagination
   */
  async fetchUserReceipts(
    context: RLSContext,
    options: {
      limit?: number; // Max: 100
      offset?: number;
      status?: Database["public"]["Tables"]["receipts"]["Row"]["status"];
    } = {}
  ): Promise<Receipt[]> {
    validateUserContext(context);
    
    // Apply pagination limits to prevent DoS attacks
    const actualLimit = Math.min(
      options.limit || PAGINATION_LIMITS.DEFAULT_LIMIT, 
      PAGINATION_LIMITS.MAX_LIMIT
    );
    
    const supabaseClient = createSecureClient(context);
    let query = supabaseClient
      .from('receipts')
      .select('*')
      .eq('user_id', context.user_id)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    query = query.limit(actualLimit);

    if (options.offset) {
      query = query.range(options.offset, options.offset + actualLimit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new RLSPolicyError(`Failed to fetch receipts: ${error.message}`, 'VALIDATION_FAILED', context);
    }

    // Type conversion for ocr_data with proper typing
    return (data || []).map(item => ({
      ...item,
      ocr_data: item.ocr_data as Receipt['ocr_data']
    })) as Receipt[];
  },
};

/**
 * Transaction Policy Helpers
 */
export const transactionPolicies = {
  /**
   * Checks if a user can access a specific transaction
   */
  canAccessTransaction(transactionUserId: string, context: RLSContext): boolean {
    return context.is_authenticated && context.user_id === transactionUserId;
  },

  /**
   * Validates transaction operation
   */
  validateTransactionOperation(transactionUserId: string, context: RLSContext): void {
    if (!this.canAccessTransaction(transactionUserId, context)) {
      throw new RLSPolicyError(
        `User ${context.user_id} cannot access transaction owned by user ${transactionUserId}`,
        'PERMISSION_DENIED',
        context
      );
    }
  },

  /**
   * Securely fetch user transactions with filtering
   */
  async fetchUserTransactions(
    context: RLSContext,
    options: {
      limit?: number; // Max: 100
      offset?: number;
      matching_status?: Database["public"]["Tables"]["transactions"]["Row"]["matching_status"];
      date_from?: string;
      date_to?: string;
    } = {}
  ): Promise<Transaction[]> {
    validateUserContext(context);
    
    // Apply pagination limits to prevent DoS attacks
    const actualLimit = Math.min(
      options.limit || PAGINATION_LIMITS.DEFAULT_LIMIT, 
      PAGINATION_LIMITS.MAX_LIMIT
    );
    
    const supabaseClient = createSecureClient(context);
    let query = supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', context.user_id)
      .order('date', { ascending: false });

    if (options.matching_status) {
      query = query.eq('matching_status', options.matching_status);
    }

    if (options.date_from) {
      query = query.gte('date', options.date_from);
    }

    if (options.date_to) {
      query = query.lte('date', options.date_to);
    }

    query = query.limit(actualLimit);

    if (options.offset) {
      query = query.range(options.offset, options.offset + actualLimit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new RLSPolicyError(`Failed to fetch transactions: ${error.message}`, 'VALIDATION_FAILED', context);
    }

    // Type conversion for freee_data with proper typing
    return (data || []).map(item => ({
      ...item,
      freee_data: item.freee_data as Transaction['freee_data']
    })) as Transaction[];
  },
};

/**
 * Processing Log Policy Helpers
 */
export const processingLogPolicies = {
  /**
   * Checks if a user can access processing logs
   */
  canAccessLogs(logUserId: string, context: RLSContext): boolean {
    return context.is_authenticated && context.user_id === logUserId;
  },

  /**
   * Validates processing log operation
   */
  validateLogOperation(logUserId: string, context: RLSContext): void {
    if (!this.canAccessLogs(logUserId, context)) {
      throw new RLSPolicyError(
        `User ${context.user_id} cannot access logs owned by user ${logUserId}`,
        'PERMISSION_DENIED',
        context
      );
    }
  },

  /**
   * Securely fetch user processing logs with pagination
   */
  async fetchUserLogs(
    context: RLSContext,
    options: {
      limit?: number; // Max: 100
      offset?: number;
      process_type?: Database["public"]["Tables"]["processing_logs"]["Row"]["process_type"];
      status?: Database["public"]["Tables"]["processing_logs"]["Row"]["status"];
      date_from?: string;
      date_to?: string;
    } = {}
  ): Promise<ProcessingLog[]> {
    validateUserContext(context);
    
    // Apply pagination limits to prevent DoS attacks
    const actualLimit = Math.min(
      options.limit || PAGINATION_LIMITS.DEFAULT_LIMIT, 
      PAGINATION_LIMITS.MAX_LIMIT
    );
    
    const supabaseClient = createSecureClient(context);
    let query = supabaseClient
      .from('processing_logs')
      .select('*')
      .eq('user_id', context.user_id)
      .order('created_at', { ascending: false });

    if (options.process_type) {
      query = query.eq('process_type', options.process_type);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.date_from) {
      query = query.gte('created_at', options.date_from);
    }

    if (options.date_to) {
      query = query.lte('created_at', options.date_to);
    }

    query = query.limit(actualLimit);

    if (options.offset) {
      query = query.range(options.offset, options.offset + actualLimit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new RLSPolicyError(`Failed to fetch processing logs: ${error.message}`, 'VALIDATION_FAILED', context);
    }

    // Type conversion for details with proper typing
    return (data || []).map(item => ({
      ...item,
      details: item.details as ProcessingLog['details']
    })) as ProcessingLog[];
  },

  /**
   * Securely create a processing log entry
   */
  async createProcessingLog(
    context: RLSContext,
    logData: {
      process_type: Database["public"]["Tables"]["processing_logs"]["Row"]["process_type"];
      status: Database["public"]["Tables"]["processing_logs"]["Row"]["status"];
      details: Record<string, any>;
      error_message?: string;
      related_receipt_id?: string;
      related_transaction_id?: string;
    }
  ): Promise<ProcessingLog> {
    validateUserContext(context);
    
    const supabaseClient = createSecureClient(context);
    const { data, error } = await supabaseClient
      .from('processing_logs')
      .insert({
        user_id: context.user_id,
        process_type: logData.process_type,
        status: logData.status,
        details: logData.details,
        error_message: logData.error_message || null,
        related_receipt_id: logData.related_receipt_id || null,
        related_transaction_id: logData.related_transaction_id || null,
      })
      .select()
      .single();

    if (error) {
      throw new RLSPolicyError(`Failed to create processing log: ${error.message}`, 'VALIDATION_FAILED', context);
    }

    // Type conversion for details with proper typing
    return {
      ...data,
      details: data.details as ProcessingLog['details']
    } as ProcessingLog;
  },
};

/**
 * Generic RLS helper functions
 */
export const rlsHelpers = {
  /**
   * Creates an RLS context from a user session
   */
  createContextFromUser(userId: string | null): RLSContext {
    return {
      user_id: userId || '',
      is_authenticated: !!userId,
    };
  },

  /**
   * Wraps a database operation with RLS validation
   */
  async withRLSValidation<T>(
    context: RLSContext,
    operation: () => Promise<T>
  ): Promise<T> {
    validateUserContext(context);
    
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        throw new RLSPolicyError(
          `RLS validation failed: ${error.message}`,
          'VALIDATION_FAILED',
          context
        );
      }
      throw error;
    }
  },

  /**
   * Validates that a user owns a resource
   */
  validateOwnership(resourceUserId: string, context: RLSContext): void {
    if (!context.is_authenticated) {
      throw new RLSPolicyError('User must be authenticated to access resources', 'AUTH_REQUIRED', context);
    }
    
    if (context.user_id !== resourceUserId) {
      throw new RLSPolicyError(
        `User ${context.user_id} does not own resource owned by ${resourceUserId}`,
        'PERMISSION_DENIED',
        context
      );
    }
  },

  /**
   * Gets pagination limits
   */
  getPaginationLimits() {
    return PAGINATION_LIMITS;
  },
};

/**
 * Aggregate object with all policy helpers for easy import
 */
export const policyHelpers = {
  userSettings: userSettingsPolicies,
  receipts: receiptPolicies,
  transactions: transactionPolicies,
  processingLogs: processingLogPolicies,
  rls: rlsHelpers,
};

export default policyHelpers;