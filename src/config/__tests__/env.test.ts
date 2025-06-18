import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env }
    
    // Reset modules to ensure fresh imports
    vi.resetModules()
    
    // Set test environment variables
    process.env.NODE_ENV = 'test'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  afterEach(() => {
    // Restore original env
    process.env = originalEnv
  })

  describe('Client Environment', () => {
    it('should load valid client environment variables', async () => {
      const { envLoader } = await import('../env')
      
      const clientEnv = envLoader.getClientEnv()
      
      expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe('http://localhost:54321')
      expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key')
      expect(clientEnv.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
      expect(clientEnv.NODE_ENV).toBe('test')
    })

    it('should throw error when client env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const { envLoader } = await import('../env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
    })

    it('should cache client environment after first load', async () => {
      const { envLoader } = await import('../env')
      
      const env1 = envLoader.getClientEnv()
      const env2 = envLoader.getClientEnv()
      
      expect(env1).toBe(env2) // Same reference due to caching
    })

    it('should validate URL format', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url'
      
      const { envLoader } = await import('../env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
    })

    it('should validate NODE_ENV values', async () => {
      process.env.NODE_ENV = 'invalid'
      
      const { envLoader } = await import('../env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should provide detailed errors in development', async () => {
      process.env.NODE_ENV = 'development'
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const { envLoader } = await import('../env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
      expect(consoleSpy).toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
      logSpy.mockRestore()
    })

    it('should provide minimal errors in production', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { envLoader } = await import('../env')
      
      expect(() => envLoader.getClientEnv()).toThrow(/Application configuration error/)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Cache Management', () => {
    it('should clear cache in development mode', async () => {
      process.env.NODE_ENV = 'development'
      
      const { envLoader } = await import('../env')
      
      // Load environment to cache it
      envLoader.getClientEnv()
      
      // Clear cache should not throw
      expect(() => envLoader.clearCache()).not.toThrow()
    })

    it('should not clear cache in production mode', async () => {
      process.env.NODE_ENV = 'production'
      
      const { envLoader } = await import('../env')
      
      // Should not throw
      expect(() => envLoader.clearCache()).not.toThrow()
    })
  })
})