import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env }
    
    // Reset modules to ensure fresh imports
    vi.resetModules()
    
    // Set test environment variables using Object.assign
    Object.assign(process.env, {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
    })
  })

  afterEach(() => {
    // Restore original env
    Object.keys(process.env).forEach(key => {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    })
    Object.assign(process.env, originalEnv)
  })

  describe('Client Environment', () => {
    it('should load valid client environment variables', async () => {
      const { envLoader } = await import('./env')
      
      const clientEnv = envLoader.getClientEnv()
      
      expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe('http://localhost:54321')
      expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key')
      expect(clientEnv.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
      expect(clientEnv.NODE_ENV).toBe('test')
    })

    it('should throw error when client env vars are missing', async () => {
      const tempUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      
      const { envLoader } = await import('./env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
      
      // Restore
      process.env.NEXT_PUBLIC_SUPABASE_URL = tempUrl
    })

    it('should cache client environment after first load', async () => {
      const { envLoader } = await import('./env')
      
      const env1 = envLoader.getClientEnv()
      const env2 = envLoader.getClientEnv()
      
      expect(env1).toBe(env2) // Same reference due to caching
    })

    it('should validate URL format', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url'
      
      const { envLoader } = await import('./env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
    })

    it('should validate NODE_ENV values', async () => {
      const tempNodeEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: 'invalid', 
        writable: true, 
        configurable: true, 
        enumerable: true 
      })
      
      const { envLoader } = await import('./env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
      
      // Restore
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: tempNodeEnv, 
        writable: true, 
        configurable: true, 
        enumerable: true 
      })
    })
  })

  describe('Error Handling', () => {
    it('should provide detailed errors in development', async () => {
      const tempNodeEnv = process.env.NODE_ENV
      const tempUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      Object.assign(process.env, {
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: undefined
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const { envLoader } = await import('./env')
      
      expect(() => envLoader.getClientEnv()).toThrow()
      expect(consoleSpy).toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
      logSpy.mockRestore()
      
      // Restore
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: tempNodeEnv, 
        writable: true, 
        configurable: true, 
        enumerable: true 
      })
      process.env.NEXT_PUBLIC_SUPABASE_URL = tempUrl
    })

    it('should provide minimal errors in production', async () => {
      const tempNodeEnv = process.env.NODE_ENV
      const tempUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      Object.assign(process.env, {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: undefined
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { envLoader } = await import('./env')
      
      expect(() => envLoader.getClientEnv()).toThrow(/Application configuration error/)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
      
      // Restore
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: tempNodeEnv, 
        writable: true, 
        configurable: true, 
        enumerable: true 
      })
      process.env.NEXT_PUBLIC_SUPABASE_URL = tempUrl
    })
  })

  describe('Cache Management', () => {
    it('should clear cache in development mode', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: 'development', 
        writable: true, 
        configurable: true, 
        enumerable: true 
      })
      
      const { envLoader } = await import('./env')
      
      // Load environment to cache it
      envLoader.getClientEnv()
      
      // Clear cache should not throw
      expect(() => envLoader.clearCache()).not.toThrow()
    })

    it('should not clear cache in production mode', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: 'production', 
        writable: true, 
        configurable: true, 
        enumerable: true 
      })
      
      const { envLoader } = await import('./env')
      
      // Should not throw
      expect(() => envLoader.clearCache()).not.toThrow()
    })
  })
})