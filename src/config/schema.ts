import { z } from 'zod';

// 機密性の高い環境変数のプレフィックス検証
const SECRET_PREFIXES = ['SK_', 'SECRET_', 'PRIVATE_'] as const;

function isSecretKey(key: string): boolean {
  return SECRET_PREFIXES.some(prefix => key.startsWith(prefix)) ||
         key.includes('_SECRET') ||
         key.includes('_KEY') ||
         key === 'SUPABASE_SERVICE_ROLE_KEY';
}

const getDefaultLogLevel = () => {
  const env = process.env.NODE_ENV;
  return env === 'production' ? 'warn' : 
         env === 'staging' ? 'info' : 'debug';
};

export const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid application URL'),

  // External API Configuration
  OCR_API_KEY: z.string().min(1, 'OCR API key is required'),
  FREEE_CLIENT_ID: z.string().min(1, 'freee client ID is required'),
  FREEE_CLIENT_SECRET: z.string().min(1, 'freee client secret is required'),
  FREEE_REDIRECT_URI: z.string().url('Invalid freee redirect URI'),

  // Optional Configuration with Environment-based Defaults
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default(getDefaultLogLevel),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),

  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
}).refine(
  (data) => {
    // クライアント環境変数に機密情報が含まれていないか検証
    const publicKeys = Object.keys(data).filter(k => k.startsWith('NEXT_PUBLIC_'));
    return !publicKeys.some(isSecretKey);
  },
  {
    message: 'Public environment variables must not contain sensitive information',
  }
);

export const clientEnvSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_APP_URL: true,
  NODE_ENV: true,
});

export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;