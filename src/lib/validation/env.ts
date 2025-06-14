import { validateEnvironment } from '../../config';

export function initializeEnvironment(): void {
  console.log('🔍 Validating environment configuration...');
  
  try {
    validateEnvironment();
    console.log('✅ Environment validation completed successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📝 Development tips:');
      console.log('1. Check your .env.local file for missing variables');
      console.log('2. Ensure all required environment variables are set');
      console.log('3. Verify URL formats are valid');
      console.log('4. Check API keys are properly configured\n');
    }
    
    throw error;
  }
}

export function getEnvironmentInfo(): Record<string, unknown> {
  return {
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    hasOcrApiKey: !!process.env.OCR_API_KEY,
    hasFreeeClientId: !!process.env.FREEE_CLIENT_ID,
    hasFreeeClientSecret: !!process.env.FREEE_CLIENT_SECRET,
    hasFreeeRedirectUri: !!process.env.FREEE_REDIRECT_URI,
  };
}