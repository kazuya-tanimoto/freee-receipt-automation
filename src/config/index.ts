import { envLoader } from './env';

export const serverConfig = {
  get supabase() {
    const env = envLoader.getServerEnv();
    return {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    };
  },

  get app() {
    const env = envLoader.getServerEnv();
    return {
      url: env.NEXT_PUBLIC_APP_URL,
      nodeEnv: env.NODE_ENV,
    };
  },

  get ocr() {
    const env = envLoader.getServerEnv();
    return {
      apiKey: env.OCR_API_KEY,
    };
  },

  get freee() {
    const env = envLoader.getServerEnv();
    return {
      clientId: env.FREEE_CLIENT_ID,
      clientSecret: env.FREEE_CLIENT_SECRET,
      redirectUri: env.FREEE_REDIRECT_URI,
    };
  },

  get logging() {
    const env = envLoader.getServerEnv();
    return {
      level: env.LOG_LEVEL,
    };
  },

  get rateLimit() {
    const env = envLoader.getServerEnv();
    return {
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
      windowMs: env.RATE_LIMIT_WINDOW_MS,
    };
  },
};

export const clientConfig = {
  get supabase() {
    const env = envLoader.getClientEnv();
    return {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  },

  get app() {
    const env = envLoader.getClientEnv();
    return {
      url: env.NEXT_PUBLIC_APP_URL,
      nodeEnv: env.NODE_ENV,
    };
  },
};

export function validateEnvironment(): void {
  try {
    envLoader.getServerEnv();
    console.log('✅ Server environment validation passed');
  } catch (error) {
    console.error('❌ Server environment validation failed:', error);
    process.exit(1);
  }

  try {
    envLoader.getClientEnv();
    console.log('✅ Client environment validation passed');
  } catch (error) {
    console.error('❌ Client environment validation failed:', error);
    process.exit(1);
  }
}

export { type Env, type ClientEnv } from './schema';