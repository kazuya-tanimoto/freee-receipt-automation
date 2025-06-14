import { NextResponse } from 'next/server';
import { initializeEnvironment, getEnvironmentInfo } from '../../../lib/validation/env';
import { serverConfig, clientConfig } from '../../../config';

export async function GET() {
  try {
    // Initialize environment
    initializeEnvironment();
    
    // Get environment info
    const envInfo = getEnvironmentInfo();
    
    // Test config access
    const configTest = {
      server: {
        supabase: {
          hasUrl: !!serverConfig.supabase.url,
          hasAnonKey: !!serverConfig.supabase.anonKey,
          hasServiceKey: !!serverConfig.supabase.serviceRoleKey,
        },
        app: {
          hasUrl: !!serverConfig.app.url,
          nodeEnv: serverConfig.app.nodeEnv,
        },
        logging: {
          level: serverConfig.logging.level,
        },
        rateLimit: {
          maxRequests: serverConfig.rateLimit.maxRequests,
          windowMs: serverConfig.rateLimit.windowMs,
        },
      },
      client: {
        supabase: {
          hasUrl: !!clientConfig.supabase.url,
          hasAnonKey: !!clientConfig.supabase.anonKey,
        },
        app: {
          hasUrl: !!clientConfig.app.url,
          nodeEnv: clientConfig.app.nodeEnv,
        },
      },
      environmentInfo: envInfo,
    };

    return NextResponse.json({
      success: true,
      message: 'Environment configuration is valid',
      data: configTest,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Environment configuration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}