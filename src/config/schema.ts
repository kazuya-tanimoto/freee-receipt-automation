import { z } from 'zod';

/**
 * Validation schema for environment variables and configuration
 */

// User profile validation
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User settings validation
export const userSettingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  receipt_auto_upload: z.boolean().default(true),
  notification_enabled: z.boolean().default(true),
  default_tax_rate: z.number().min(0).max(100).default(10),
  auto_categorization: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Receipt validation
export const receiptSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  file_path: z.string(),
  file_name: z.string(),
  file_size: z.number().positive(),
  mime_type: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  ocr_result: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Transaction validation
export const transactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  receipt_id: z.string().uuid().optional(),
  amount: z.number(),
  tax_amount: z.number().default(0),
  description: z.string(),
  category: z.string(),
  date: z.string().date(),
  vendor: z.string().optional(),
  status: z.enum(['draft', 'confirmed', 'synced']),
  freee_transaction_id: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// API validation schemas
export const signUpRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().optional(),
});

export const signInRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Environment validation helper
export function validateEnvVar(name: string, value: string | undefined): { isValid: boolean; error?: string } {
  if (!value) {
    return { isValid: false, error: `${name} is not set` };
  }
  return { isValid: true };
}

// 機密性の高い環境変数の包括的検証
const SECRET_PATTERNS = {
  // プレフィックスパターン
  prefixes: ['SK_', 'SECRET_', 'PRIVATE_', 'API_KEY_', 'TOKEN_'] as const,
  
  // サフィックスパターン  
  suffixes: ['_SECRET', '_KEY', '_TOKEN', '_PASSWORD', '_PRIVATE', '_CREDENTIALS'] as const,
  
  // 完全一致パターン（高機密）
  exact: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_PASSWORD', 
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ] as const,
  
  // 部分一致パターン（危険度の高いキーワード）
  includes: ['PASSWORD', 'CREDENTIAL', 'ENCRYPT'] as const,
};

/**
 * 環境変数名が機密情報を含む可能性があるかを判定
 * 
 * @param key - 環境変数名
 * @returns 機密情報の可能性がある場合true
 */
function isSecretKey(key: string): boolean {
  const upperKey = key.toUpperCase();
  
  return (
    // プレフィックスチェック
    SECRET_PATTERNS.prefixes.some(prefix => upperKey.startsWith(prefix)) ||
    
    // サフィックスチェック
    SECRET_PATTERNS.suffixes.some(suffix => upperKey.endsWith(suffix)) ||
    
    // 完全一致チェック
    SECRET_PATTERNS.exact.some(exact => upperKey === exact) ||
    
    // 部分一致チェック（PASSWORD等）
    SECRET_PATTERNS.includes.some(pattern => upperKey.includes(pattern))
  );
}

/**
 * NEXT_PUBLIC_プレフィックス変数の安全性を検証
 * 
 * @param envData - 環境変数データ
 * @returns 検証結果とエラー詳細
 */
function validatePublicVariableSecurity(envData: Record<string, unknown>) {
  const publicKeys = Object.keys(envData).filter(k => k.startsWith('NEXT_PUBLIC_'));
  const unsafeKeys = publicKeys.filter(isSecretKey);
  
  if (unsafeKeys.length > 0) {
    return {
      isValid: false,
      message: `Potentially sensitive variables detected in NEXT_PUBLIC_ scope: ${unsafeKeys.join(', ')}. These will be exposed to client-side code.`,
      unsafeKeys
    };
  }
  
  return { isValid: true };
}

// Default log level based on NODE_ENV with type safety
const DEFAULT_LOG_LEVELS = {
  production: 'warn',
  staging: 'info',
  development: 'debug',
  test: 'debug'
} as const;

const getDefaultLogLevel = (): 'debug' | 'info' | 'warn' | 'error' => {
  const env = process.env.NODE_ENV as keyof typeof DEFAULT_LOG_LEVELS;
  return DEFAULT_LOG_LEVELS[env] || 'debug';
};

const baseEnvSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Application Configuration - with default for development flexibility
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid application URL').default('http://localhost:3000'),

  // External API Configuration - required for PBI-1-1-4 functionality
  OCR_API_KEY: z.string().min(1, 'OCR API key is required'),
  FREEE_CLIENT_ID: z.string().min(1, 'freee client ID is required'),
  FREEE_CLIENT_SECRET: z.string().min(1, 'freee client secret is required'),
  FREEE_REDIRECT_URI: z.string().url('Invalid freee redirect URI'),

  // Authentication Configuration - from main branch integration
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL').optional(),

  // Optional Configuration with Environment-based Defaults
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default(getDefaultLogLevel),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),

  // Environment - includes test environment for comprehensive support
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
});

// Client-side environment schema (only NEXT_PUBLIC_ variables)
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production', 'staging']),
});

// Development environment schema - flexible for development
const developmentEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('development'),
  // Development can have optional external services
  OCR_API_KEY: z.string().min(1, 'OCR API key is required').optional(),
  FREEE_CLIENT_ID: z.string().min(1, 'freee client ID is required').optional(),
  FREEE_CLIENT_SECRET: z.string().min(1, 'freee client secret is required').optional(),
  FREEE_REDIRECT_URI: z.string().url('Invalid freee redirect URI').optional(),
});

// Test environment schema - similar to development
const testEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('test'),
  // Test environment doesn't require external services
  OCR_API_KEY: z.string().min(1, 'OCR API key is required').optional(),
  FREEE_CLIENT_ID: z.string().min(1, 'freee client ID is required').optional(),
  FREEE_CLIENT_SECRET: z.string().min(1, 'freee client secret is required').optional(),
  FREEE_REDIRECT_URI: z.string().url('Invalid freee redirect URI').optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret required for testing').optional(),
  NEXTAUTH_URL: z.string().url('NextAuth URL required for testing').optional(),
});

// Production environment schema - strict requirements
const productionEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('production'),
  // Production requires all services configured
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required in production'),
  OCR_API_KEY: z.string().min(1, 'OCR API key is required in production'),
  FREEE_CLIENT_ID: z.string().min(1, 'freee client ID is required in production'),
  FREEE_CLIENT_SECRET: z.string().min(1, 'freee client secret is required in production'),
  FREEE_REDIRECT_URI: z.string().url('Invalid freee redirect URI'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret is required in production'),
  NEXTAUTH_URL: z.string().url('NextAuth URL is required in production'),
});

// Staging environment schema - production-like requirements
const stagingEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('staging'),
  // Staging requires most services for testing
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required in staging'),
  OCR_API_KEY: z.string().min(1, 'OCR API key is required in staging'),
  FREEE_CLIENT_ID: z.string().min(1, 'freee client ID is required in staging'),
  FREEE_CLIENT_SECRET: z.string().min(1, 'freee client secret is required in staging'),
  FREEE_REDIRECT_URI: z.string().url('Invalid freee redirect URI'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret is required in staging'),
  NEXTAUTH_URL: z.string().url('NextAuth URL is required in staging'),
});

// Combined environment schema with security validation
export const envSchema = z.discriminatedUnion('NODE_ENV', [
  developmentEnvSchema,
  testEnvSchema,
  productionEnvSchema,
  stagingEnvSchema,
]).refine(
  (data) => {
    // NEXT_PUBLIC_プレフィックス変数の安全性を詳細検証
    const validation = validatePublicVariableSecurity(data);
    return validation.isValid;
  },
  {
    message: 'Security validation failed: Public environment variables contain sensitive information that will be exposed to client-side code',
  }
);

export type EnvSchema = z.infer<typeof envSchema>;
export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// Validate environment variables
export function validateEnv(): EnvSchema {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Invalid environment configuration');
  }
  
  return result.data;
}

// Type exports
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
export type SignInRequest = z.infer<typeof signInRequestSchema>;