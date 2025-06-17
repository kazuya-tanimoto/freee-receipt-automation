import { z } from 'zod';

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

  // Environment - Added 'test' to fix TypeScript error
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
});

export const clientEnvSchema = baseEnvSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_APP_URL: true,
  NODE_ENV: true,
});

export const envSchema = baseEnvSchema.refine(
  (data) => {
    // NEXT_PUBLIC_プレフィックス変数の安全性を詳細検証
    const validation = validatePublicVariableSecurity(data);
    return validation.isValid;
  },
  {
    message: 'Security validation failed: Public environment variables contain sensitive information that will be exposed to client-side code',
  }
);

export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;