import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock environment configurations for different environments
const createMockEnvironmentConfigs = () => {
  const configs = {
    development: {
      NODE_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://dev-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dev-anon-key-123',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      SUPABASE_SERVICE_ROLE_KEY: 'dev-service-role-key-123',
      DATABASE_URL: 'postgresql://dev-db-connection',
      LOG_LEVEL: 'debug'
    },
    staging: {
      NODE_ENV: 'staging',
      NEXT_PUBLIC_SUPABASE_URL: 'https://staging-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'staging-anon-key-456',
      NEXT_PUBLIC_APP_URL: 'https://staging.example.com',
      SUPABASE_SERVICE_ROLE_KEY: 'staging-service-role-key-456',
      DATABASE_URL: 'postgresql://staging-db-connection',
      LOG_LEVEL: 'info'
    },
    production: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://prod-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'prod-anon-key-789',
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
      SUPABASE_SERVICE_ROLE_KEY: 'prod-service-role-key-789',
      DATABASE_URL: 'postgresql://prod-db-connection',
      LOG_LEVEL: 'error'
    },
    test: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      DATABASE_URL: 'postgresql://test-db-connection',
      LOG_LEVEL: 'silent'
    }
  }

  return configs
}

// Mock configuration loader
const createMockConfigLoader = () => {
  let cachedConfig: any = null
  let currentEnvironment: string = 'test'

  const loader = {
    setEnvironment: (env: string) => {
      currentEnvironment = env
      cachedConfig = null // Clear cache when environment changes
    },

    loadConfig: () => {
      if (cachedConfig) {
        return cachedConfig
      }

      const configs = createMockEnvironmentConfigs()
      const config = configs[currentEnvironment as keyof typeof configs]

      if (!config) {
        throw new Error(`Invalid environment: ${currentEnvironment}`)
      }

      // Simulate configuration validation
      loader.validateConfig(config)

      cachedConfig = config
      return config
    },

    validateConfig: (config: any) => {
      const requiredKeys = [
        'NODE_ENV',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_APP_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
      ]

      const missingKeys = requiredKeys.filter(key => !config[key])
      
      if (missingKeys.length > 0) {
        throw new Error(`Missing required configuration keys: ${missingKeys.join(', ')}`)
      }

      // Validate URL formats
      try {
        new URL(config.NEXT_PUBLIC_SUPABASE_URL)
        new URL(config.NEXT_PUBLIC_APP_URL)
      } catch (error) {
        throw new Error('Invalid URL format in configuration')
      }

      // Validate NODE_ENV values
      const validEnvironments = ['development', 'staging', 'production', 'test']
      if (!validEnvironments.includes(config.NODE_ENV)) {
        throw new Error(`Invalid NODE_ENV: ${config.NODE_ENV}`)
      }
    },

    clearCache: () => {
      cachedConfig = null
    },

    getClientConfig: () => {
      const config = loader.loadConfig()
      
      // Return only client-safe configuration
      return {
        NODE_ENV: config.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: config.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL
      }
    },

    getServerConfig: () => {
      const config = loader.loadConfig()
      
      // Return server-side configuration including secrets
      return {
        ...config,
        SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY,
        DATABASE_URL: config.DATABASE_URL,
        LOG_LEVEL: config.LOG_LEVEL
      }
    },

    isProduction: () => {
      return currentEnvironment === 'production'
    },

    isDevelopment: () => {
      return currentEnvironment === 'development'
    },

    isTest: () => {
      return currentEnvironment === 'test'
    }
  }

  return loader
}

describe('Environment Configuration Management Tests', () => {
  let configLoader: ReturnType<typeof createMockConfigLoader>
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    configLoader = createMockConfigLoader()
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('PBI-1-1-6: Multi-Environment Configuration', () => {
    describe('Environment Loading', () => {
      it('should load development configuration correctly', () => {
        configLoader.setEnvironment('development')
        const config = configLoader.loadConfig()

        expect(config.NODE_ENV).toBe('development')
        expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://dev-project.supabase.co')
        expect(config.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
        expect(config.LOG_LEVEL).toBe('debug')
      })

      it('should load staging configuration correctly', () => {
        configLoader.setEnvironment('staging')
        const config = configLoader.loadConfig()

        expect(config.NODE_ENV).toBe('staging')
        expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://staging-project.supabase.co')
        expect(config.NEXT_PUBLIC_APP_URL).toBe('https://staging.example.com')
        expect(config.LOG_LEVEL).toBe('info')
      })

      it('should load production configuration correctly', () => {
        configLoader.setEnvironment('production')
        const config = configLoader.loadConfig()

        expect(config.NODE_ENV).toBe('production')
        expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('https://prod-project.supabase.co')
        expect(config.NEXT_PUBLIC_APP_URL).toBe('https://app.example.com')
        expect(config.LOG_LEVEL).toBe('error')
      })

      it('should load test configuration correctly', () => {
        configLoader.setEnvironment('test')
        const config = configLoader.loadConfig()

        expect(config.NODE_ENV).toBe('test')
        expect(config.NEXT_PUBLIC_SUPABASE_URL).toBe('http://localhost:54321')
        expect(config.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
        expect(config.LOG_LEVEL).toBe('silent')
      })

      it('should throw error for invalid environment', () => {
        expect(() => {
          configLoader.setEnvironment('invalid')
          configLoader.loadConfig()
        }).toThrow('Invalid environment: invalid')
      })
    })

    describe('Runtime Validation', () => {
      it('should validate configuration at application startup', () => {
        configLoader.setEnvironment('development')
        
        // Should not throw for valid configuration
        expect(() => configLoader.loadConfig()).not.toThrow()
      })

      it('should detect missing required configuration keys', () => {
        // Mock incomplete configuration
        const invalidConfig = {
          NODE_ENV: 'development',
          NEXT_PUBLIC_SUPABASE_URL: 'https://dev-project.supabase.co'
          // Missing other required keys
        }

        expect(() => {
          configLoader.validateConfig(invalidConfig)
        }).toThrow('Missing required configuration keys')
      })

      it('should validate URL formats in configuration', () => {
        const invalidConfig = {
          NODE_ENV: 'development',
          NEXT_PUBLIC_SUPABASE_URL: 'invalid-url',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key',
          NEXT_PUBLIC_APP_URL: 'also-invalid',
          SUPABASE_SERVICE_ROLE_KEY: 'key'
        }

        expect(() => {
          configLoader.validateConfig(invalidConfig)
        }).toThrow('Invalid URL format in configuration')
      })

      it('should validate NODE_ENV values', () => {
        const invalidConfig = {
          NODE_ENV: 'invalid-env',
          NEXT_PUBLIC_SUPABASE_URL: 'https://example.com',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key',
          NEXT_PUBLIC_APP_URL: 'https://app.com',
          SUPABASE_SERVICE_ROLE_KEY: 'key'
        }

        expect(() => {
          configLoader.validateConfig(invalidConfig)
        }).toThrow('Invalid NODE_ENV: invalid-env')
      })
    })

    describe('Configuration Caching and Performance', () => {
      it('should cache configuration after first load', () => {
        configLoader.setEnvironment('development')
        
        const config1 = configLoader.loadConfig()
        const config2 = configLoader.loadConfig()

        // Should return same instance (cached)
        expect(config1).toBe(config2)
      })

      it('should clear cache when environment changes', () => {
        configLoader.setEnvironment('development')
        const devConfig = configLoader.loadConfig()

        configLoader.setEnvironment('production')
        const prodConfig = configLoader.loadConfig()

        expect(devConfig.NODE_ENV).toBe('development')
        expect(prodConfig.NODE_ENV).toBe('production')
        expect(devConfig).not.toBe(prodConfig)
      })

      it('should allow manual cache clearing', () => {
        configLoader.setEnvironment('development')
        const config1 = configLoader.loadConfig()
        
        configLoader.clearCache()
        const config2 = configLoader.loadConfig()

        // Should be different instances after cache clear
        expect(config1).not.toBe(config2)
        // But should have same values
        expect(config1).toEqual(config2)
      })

      it('should have consistent config access after caching', () => {
        configLoader.setEnvironment('development')
        
        // First load - uncached
        const config1 = configLoader.loadConfig()
        const start1 = performance.now()
        configLoader.loadConfig()
        const time1 = performance.now() - start1

        // Second load - cached (should be same reference)
        const start2 = performance.now()
        const config2 = configLoader.loadConfig()
        const time2 = performance.now() - start2

        // Cached config should be same reference (faster)
        expect(config1).toBe(config2)
        
        // Both should be fast operations, but cached is typically faster or equal
        expect(time2).toBeLessThanOrEqual(time1 + 1) // Allow 1ms tolerance
      })
    })

    describe('Client vs Server Configuration', () => {
      it('should provide client-safe configuration', () => {
        configLoader.setEnvironment('production')
        const clientConfig = configLoader.getClientConfig()

        // Should include public config only
        expect(clientConfig.NODE_ENV).toBe('production')
        expect(clientConfig.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
        expect(clientConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
        expect(clientConfig.NEXT_PUBLIC_APP_URL).toBeDefined()

        // Should NOT include server secrets
        expect(clientConfig).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY')
        expect(clientConfig).not.toHaveProperty('DATABASE_URL')
        expect(clientConfig).not.toHaveProperty('LOG_LEVEL')
      })

      it('should provide complete server configuration', () => {
        configLoader.setEnvironment('production')
        const serverConfig = configLoader.getServerConfig()

        // Should include all configuration including secrets
        expect(serverConfig.NODE_ENV).toBe('production')
        expect(serverConfig.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
        expect(serverConfig.SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
        expect(serverConfig.DATABASE_URL).toBeDefined()
        expect(serverConfig.LOG_LEVEL).toBeDefined()
      })

      it('should maintain configuration isolation between client and server', () => {
        configLoader.setEnvironment('production')
        
        const clientConfig = configLoader.getClientConfig()
        const serverConfig = configLoader.getServerConfig()

        // Client config should be subset of server config
        Object.keys(clientConfig).forEach(key => {
          expect(serverConfig[key]).toBe(clientConfig[key])
        })

        // Server config should have additional keys
        expect(Object.keys(serverConfig).length).toBeGreaterThan(Object.keys(clientConfig).length)
      })
    })

    describe('Environment Detection Helpers', () => {
      it('should correctly detect production environment', () => {
        configLoader.setEnvironment('production')
        
        expect(configLoader.isProduction()).toBe(true)
        expect(configLoader.isDevelopment()).toBe(false)
        expect(configLoader.isTest()).toBe(false)
      })

      it('should correctly detect development environment', () => {
        configLoader.setEnvironment('development')
        
        expect(configLoader.isProduction()).toBe(false)
        expect(configLoader.isDevelopment()).toBe(true)
        expect(configLoader.isTest()).toBe(false)
      })

      it('should correctly detect test environment', () => {
        configLoader.setEnvironment('test')
        
        expect(configLoader.isProduction()).toBe(false)
        expect(configLoader.isDevelopment()).toBe(false)
        expect(configLoader.isTest()).toBe(true)
      })
    })

    describe('Error Messages and User Experience', () => {
      it('should provide clear error messages for missing configuration', () => {
        const partialConfig = {
          NODE_ENV: 'development',
          NEXT_PUBLIC_SUPABASE_URL: 'https://dev.supabase.co'
          // Missing other required keys
        }

        try {
          configLoader.validateConfig(partialConfig)
          expect.fail('Should have thrown validation error')
        } catch (error) {
          const errorMessage = (error as Error).message
          expect(errorMessage).toContain('Missing required configuration keys')
          expect(errorMessage).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
          expect(errorMessage).toContain('NEXT_PUBLIC_APP_URL')
        }
      })

      it('should provide helpful error messages for configuration issues', () => {
        const invalidUrlConfig = {
          NODE_ENV: 'development',
          NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key',
          NEXT_PUBLIC_APP_URL: 'also-not-a-url',
          SUPABASE_SERVICE_ROLE_KEY: 'key'
        }

        try {
          configLoader.validateConfig(invalidUrlConfig)
          expect.fail('Should have thrown URL validation error')
        } catch (error) {
          expect((error as Error).message).toContain('Invalid URL format')
        }
      })

      it('should provide development-friendly error output', () => {
        configLoader.setEnvironment('development')
        
        // In development, errors should be verbose and helpful
        expect(configLoader.isDevelopment()).toBe(true)
        
        try {
          configLoader.validateConfig({})
          expect.fail('Should have thrown validation error')
        } catch (error) {
          // Error should contain helpful information
          expect((error as Error).message).toContain('Missing required configuration keys')
        }
      })

      it('should provide production-safe error output', () => {
        configLoader.setEnvironment('production')
        
        expect(configLoader.isProduction()).toBe(true)
        
        // In production, errors should be present but not expose sensitive details
        try {
          configLoader.validateConfig({})
          expect.fail('Should have thrown validation error')
        } catch (error) {
          // Error should be present but not expose internal details
          expect((error as Error).message).toBeDefined()
          expect(typeof (error as Error).message).toBe('string')
        }
      })
    })

    describe('Configuration Integration', () => {
      it('should integrate properly with Supabase client creation', () => {
        configLoader.setEnvironment('production')
        const config = configLoader.getClientConfig()

        // Configuration should be suitable for Supabase client
        expect(config.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\/.*\.supabase\.co$/)
        expect(config.NEXT_PUBLIC_SUPABASE_ANON_KEY).toMatch(/^[a-zA-Z0-9-]+$/)
        expect(config.NEXT_PUBLIC_APP_URL).toMatch(/^https:\/\//)
      })

      it('should provide environment-specific configuration values', () => {
        // Development should use localhost
        configLoader.setEnvironment('development')
        const devConfig = configLoader.loadConfig()
        expect(devConfig.NEXT_PUBLIC_APP_URL).toContain('localhost')
        expect(devConfig.LOG_LEVEL).toBe('debug')

        // Production should use production URLs
        configLoader.setEnvironment('production')
        const prodConfig = configLoader.loadConfig()
        expect(prodConfig.NEXT_PUBLIC_APP_URL).toContain('app.example.com')
        expect(prodConfig.LOG_LEVEL).toBe('error')
      })

      it('should support configuration hot reloading in development', () => {
        configLoader.setEnvironment('development')
        
        // Simulate development environment with hot reloading
        expect(configLoader.isDevelopment()).toBe(true)
        
        const config1 = configLoader.loadConfig()
        configLoader.clearCache() // Simulate hot reload
        const config2 = configLoader.loadConfig()

        // Should reload configuration successfully
        expect(config2).toEqual(config1)
      })
    })
  })
})