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

    get freee() {
      const env = getEnv();
      return {
        clientId: env.FREEE_CLIENT_ID,
        clientSecret: env.FREEE_CLIENT_SECRET,
      };
    },

    get logging() {
      const env = getEnv();
      return {
        level: env.LOG_LEVEL,
      };
    },

    get auth() {
      const env = getEnv();
      return {
        secret: env.NEXTAUTH_SECRET,
        url: env.NEXTAUTH_URL,
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
export type ServerConfig = ReturnType<typeof createServerConfig>;
export type ClientConfig = ReturnType<typeof createClientConfig>;