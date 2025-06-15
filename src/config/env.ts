import { z } from 'zod';
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
      if (error instanceof z.ZodError) {
        const missingVars = error.errors
          .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
          .map(e => e.path.join('.'));
        
        console.error('❌ Server environment validation failed:');
        console.error('Missing variables:', missingVars);
        console.error('Validation errors:', error.format());
      }
      throw new Error('Server environment validation failed. Check console for details.');
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
      if (error instanceof z.ZodError) {
        const missingVars = error.errors
          .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
          .map(e => e.path.join('.'));
        
        console.error('❌ Client environment validation failed:');
        console.error('Missing variables:', missingVars);
        console.error('Validation errors:', error.format());
      }
      throw new Error('Client environment validation failed. Check console for details.');
    }
  }

  function clearCache() {
    if (process.env.NODE_ENV === 'development') {
      _serverEnv = null;
      _clientEnv = null;
    }
  }

  return {
    getServerEnv,
    getClientEnv,
    clearCache,
  };
}

export const envLoader = createEnvLoader();