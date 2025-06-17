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

const getDefaultLogLevel = () => {
  const env = process.env.NODE_ENV as string;
  return env === 'production' ? 'warn' : 
         env === 'staging' ? 'info' : 'debug';
};

const baseEnvSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Supabase service key is required').optional(),
  
  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  
  // Freee API Configuration
  FREEE_CLIENT_ID: z.string().min(1, 'Freee client ID is required').optional(),
  FREEE_CLIENT_SECRET: z.string().min(1, 'Freee client secret is required').optional(),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default(getDefaultLogLevel()),
  
  // Security Configuration
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters').optional(),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL').optional(),
});

// Client-side environment schema (only NEXT_PUBLIC_ variables)
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production', 'staging']),
});

// Development environment schema
const developmentEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('development'),
});

// Test environment schema
const testEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('test'),
});

// Production environment schema
const productionEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('production'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Supabase service key is required in production'),
  FREEE_CLIENT_ID: z.string().min(1, 'Freee client ID is required in production'),
  FREEE_CLIENT_SECRET: z.string().min(1, 'Freee client secret is required in production'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret is required in production'),
  NEXTAUTH_URL: z.string().url('NextAuth URL is required in production'),
});

// Staging environment schema
const stagingEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('staging'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Supabase service key is required in staging'),
  FREEE_CLIENT_ID: z.string().min(1, 'Freee client ID is required in staging'),
  FREEE_CLIENT_SECRET: z.string().min(1, 'Freee client secret is required in staging'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret is required in staging'),
  NEXTAUTH_URL: z.string().url('NextAuth URL is required in staging'),
});

// Combined environment schema
export const envSchema = z.discriminatedUnion('NODE_ENV', [
  developmentEnvSchema,
  testEnvSchema,
  productionEnvSchema,
  stagingEnvSchema,
]);

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