/**
 * OAuth Test Setup and Mocks
 * 
 * Common test setup for OAuth module tests
 */

import { beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// Test Setup and Mocks
// ============================================================================

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        updateUserById: vi.fn(),
        getUserById: vi.fn()
      }
    }
  }))
}));

// Mock crypto for deterministic tests
vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>();
  return {
    ...actual,
    randomBytes: vi.fn((size: number) => Buffer.alloc(size, 'a')),
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => Buffer.from('mocked-hash'))
    })),
    createCipher: vi.fn(() => ({
      setAAD: vi.fn(),
      update: vi.fn(() => 'encrypted'),
      final: vi.fn(() => ''),
      getAuthTag: vi.fn(() => Buffer.from('tag'))
    })),
    createDecipher: vi.fn(() => ({
      setAAD: vi.fn(),
      setAuthTag: vi.fn(),
      update: vi.fn(() => 'decrypted'),
      final: vi.fn(() => '')
    })),
    scryptSync: vi.fn(() => Buffer.alloc(32))
  };
});

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
const originalEnv = process.env;

export function setupOAuthTestEnv() {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      GOOGLE_OAUTH_CLIENT_ID: 'test-client-id',
      GOOGLE_OAUTH_CLIENT_SECRET: 'test-client-secret',
      OAUTH_ENCRYPTION_KEY: 'test-encryption-key',
      NEXT_PUBLIC_APP_URL: 'https://test.example.com'
    };
    // Reset fetch mock
    vi.clearAllMocks();
    global.fetch = vi.fn() as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });
}