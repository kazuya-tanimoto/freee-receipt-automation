import { envLoader } from './env';

function createServerConfig() {
  let _env: ReturnType<typeof envLoader.getServerEnv> | null = null;
  
  const getEnv = () => {
    if (!_env) {
      _env = envLoader.getServerEnv();
    }
    return _env;
  };

  return {
    get supabase() {
      const env = getEnv();
      return {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      };
    },

    get app() {
      const env = getEnv();
      return {
        url: env.NEXT_PUBLIC_APP_URL,
        nodeEnv: env.NODE_ENV,
      };
    },

    get ocr() {
      const env = getEnv();
      return {
        apiKey: env.OCR_API_KEY,
      };
    },

    get freee() {
      const env = getEnv();
      return {
        clientId: env.FREEE_CLIENT_ID,
        clientSecret: env.FREEE_CLIENT_SECRET,
        redirectUri: env.FREEE_REDIRECT_URI,
      };
    },

    get logging() {
      const env = getEnv();
      return {
        level: env.LOG_LEVEL,
      };
    },

    get rateLimit() {
      const env = getEnv();
      return {
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
        windowMs: env.RATE_LIMIT_WINDOW_MS,
      };
    },

    get all() {
      const env = getEnv();
      return {
        supabase: {
          url: env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
        },
        app: {
          url: env.NEXT_PUBLIC_APP_URL,
          nodeEnv: env.NODE_ENV,
        },
        ocr: {
          apiKey: env.OCR_API_KEY,
        },
        freee: {
          clientId: env.FREEE_CLIENT_ID,
          clientSecret: env.FREEE_CLIENT_SECRET,
          redirectUri: env.FREEE_REDIRECT_URI,
        },
        logging: {
          level: env.LOG_LEVEL,
        },
        rateLimit: {
          maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
          windowMs: env.RATE_LIMIT_WINDOW_MS,
        },
      };
    },
  };
}

function createClientConfig() {
  let _env: ReturnType<typeof envLoader.getClientEnv> | null = null;
  
  const getEnv = () => {
    if (!_env) {
      _env = envLoader.getClientEnv();
    }
    return _env;
  };

  return {
    get supabase() {
      const env = getEnv();
      return {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      };
    },

    get app() {
      const env = getEnv();
      return {
        url: env.NEXT_PUBLIC_APP_URL,
        nodeEnv: env.NODE_ENV,
      };
    },

    get all() {
      const env = getEnv();
      return {
        supabase: {
          url: env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        app: {
          url: env.NEXT_PUBLIC_APP_URL,
          nodeEnv: env.NODE_ENV,
        },
      };
    },
  };
}

export const serverConfig = createServerConfig();
export const clientConfig = createClientConfig();

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

// Configuration type exports for external use
export type ServerConfig = {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  app: {
    url: string;
    nodeEnv: string;
  };
  ocr: {
    apiKey: string;
  };
  freee: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  logging: {
    level: string;
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
};

export type ClientConfig = {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    url: string;
    nodeEnv: string;
  };
};