/**
 * PBI-1-1-4: RLS Policy Helper Functions
 * 
 * This module provides helper functions for working with Row Level Security (RLS)
 * policies in the freee receipt automation system. These functions encapsulate
 * common patterns for user-scoped database operations.
 */

import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import type {
  Database,
  UserSettings,
  Receipt,
  Transaction,
  ProcessingLog,
  RLSContext,
  SecureOperation,
} from '@/types/database';

/**
 * Error thrown when RLS policy validation fails
 */
export class RLSPolicyError extends Error {
  constructor(message: string, public readonly context?: RLSContext) {
    super(message);
    this.name = 'RLSPolicyError';
  }
}

/**
 * Validates that a user context is properly authenticated
 */
export function validateUserContext(context: RLSContext): void {
  if (!context.is_authenticated) {
    throw new RLSPolicyError('User must be authenticated', context);
  }
  
  if (!context.user_id) {
    throw new RLSPolicyError('User ID is required', context);
  }
}

/**
 * Creates a Supabase client with RLS context for server-side operations
 */
export function createSecureClient(context: RLSContext) {
  validateUserContext(context);
  
  // For server-side operations, we need to set the user context
  return createServerClient();
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
        context
      );
    }
  },

  /**
   * Securely fetch user settings
   */
  async fetchUserSettings(context: RLSContext): Promise<UserSettings | null> {
    validateUserContext(context);
    
    const supabase = createSecureClient(context);
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', context.user_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new RLSPolicyError(`Failed to fetch user settings: ${error.message}`, context);
    }

    return data;
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
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ): Promise<Receipt[]> {
    validateUserContext(context);
    
    const supabase = createSecureClient(context);
    let query = supabase
      .from('receipts')
      .select('*')
      .eq('user_id', context.user_id)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new RLSPolicyError(`Failed to fetch receipts: ${error.message}`, context);
    }

    return data || [];
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
      limit?: number;
      offset?: number;
      matching_status?: string;
      date_from?: string;
      date_to?: string;
    } = {}
  ): Promise<Transaction[]> {
    validateUserContext(context);
    
    const supabase = createSecureClient(context);
    let query = supabase
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

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new RLSPolicyError(`Failed to fetch transactions: ${error.message}`, context);
    }

    return data || [];
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
        context
      );
    }
  },

  /**
   * Securely create a processing log entry
   */
  async createProcessingLog(
    context: RLSContext,
    logData: {
      process_type: string;
      status: string;
      details: Record<string, any>;
      error_message?: string;
      related_receipt_id?: string;
      related_transaction_id?: string;
    }
  ): Promise<ProcessingLog> {
    validateUserContext(context);
    
    const supabase = createSecureClient(context);
    const { data, error } = await supabase
      .from('processing_logs')
      .insert({
        user_id: context.user_id,
        ...logData,
      })
      .select()
      .single();

    if (error) {
      throw new RLSPolicyError(`Failed to create processing log: ${error.message}`, context);
    }

    return data;
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
      throw new RLSPolicyError('User must be authenticated to access resources', context);
    }
    
    if (context.user_id !== resourceUserId) {
      throw new RLSPolicyError(
        `User ${context.user_id} does not own resource owned by ${resourceUserId}`,
        context
      );
    }
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