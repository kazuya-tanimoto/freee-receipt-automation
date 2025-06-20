/**
 * Type definitions for test environment
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_APP_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

// Override process.env for tests to allow modifications
declare global {
  namespace globalThis {
    var process: {
      env: Record<string, string | undefined>;
    };
  }
}

export {};