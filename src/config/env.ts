import { z } from 'zod';
import { envSchema, clientEnvSchema, type Env, type ClientEnv } from './schema';

/**
 * 環境に応じたエラーログレベルを制御
 */
function handleEnvironmentError(error: unknown, context: 'server' | 'client'): never {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error instanceof z.ZodError) {
    if (isDevelopment) {
      // 開発環境: 詳細なデバッグ情報を提供
      const missingVars = error.errors
        .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
        .map(e => e.path.join('.'));
      
      console.error(`❌ ${context} environment validation failed:`);
      console.error('Missing variables:', missingVars);
      console.error('Validation errors:', error.format());
      
      // 開発時のヘルプメッセージ
      console.log('\n📝 Development tips:');
      console.log('1. Check your .env.local file for missing variables');
      console.log('2. Ensure all required environment variables are set');
      console.log('3. Verify URL formats are valid');
      console.log('4. Check API keys are properly configured\n');
    } else {
      // 本番環境: 最小限のログ（機密情報漏洩防止）
      console.error(`Environment configuration error in ${context} context`);
      
      if (!isProduction) {
        // ステージング環境では一部詳細を表示
        const errorCount = error.errors.length;
        console.error(`Configuration issues found: ${errorCount} validation errors`);
      }
    }
  } else {
    // ZodError以外のエラー
    console.error(`Unexpected error during ${context} environment validation:`, 
      isDevelopment ? error : 'Configuration system error');
  }
  
  // 本番環境では汎用的なエラーメッセージ
  const publicMessage = isProduction 
    ? 'Application configuration error. Please check server logs.'
    : `${context} environment validation failed. Check console for details.`;
    
  throw new Error(publicMessage);
}

function createEnvLoader() {
  let _serverEnv: Env | null = null;
  let _clientEnv: ClientEnv | null = null;

  function getServerEnv(): Env {
    if (_serverEnv) return _serverEnv;

    try {
      _serverEnv = envSchema.parse(process.env);
      return _serverEnv;
    } catch (error) {
      handleEnvironmentError(error, 'server');
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
      handleEnvironmentError(error, 'client');
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