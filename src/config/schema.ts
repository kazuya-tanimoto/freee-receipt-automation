import { z } from 'zod';

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

  // Optional Configuration with Defaults
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),

  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

export const clientEnvSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_APP_URL: true,
  NODE_ENV: true,
});

export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;