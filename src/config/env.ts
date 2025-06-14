import { envSchema, clientEnvSchema, type Env, type ClientEnv } from './schema';

function createEnvLoader() {
  let _serverEnv: Env | null = null;
  let _clientEnv: ClientEnv | null = null;

  function getServerEnv(): Env {
    if (_serverEnv) return _serverEnv;

    try {
      _serverEnv = envSchema.parse(process.env);
      return _serverEnv;
    } catch (error) {
      console.error('❌ Invalid server environment variables:', error);
      throw new Error('Server environment validation failed');
    }
  }

  function getClientEnv(): ClientEnv {
    if (_clientEnv) return _clientEnv;

    const clientEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    };

    try {
      _clientEnv = clientEnvSchema.parse(clientEnvVars);
      return _clientEnv;
    } catch (error) {
      console.error('❌ Invalid client environment variables:', error);
      throw new Error('Client environment validation failed');
    }
  }

  return {
    getServerEnv,
    getClientEnv,
  };
}

export const envLoader = createEnvLoader();