# PBI-1-1-6: Environment Configuration

## Description

Set up comprehensive environment configuration management for the application. This includes creating a centralized
configuration system, implementing validation with Zod, and setting up deployment-specific configurations.

## Implementation Details

### Files to Create/Modify

1. `src/config/index.ts` - Main configuration module
2. `src/config/schema.ts` - Zod schemas for configuration validation
3. `src/config/env.ts` - Environment variable loader
4. `.env.local` - Local development variables (update)
5. `.env.production` - Production environment template
6. `src/lib/validation/env.ts` - Runtime environment validation

### Technical Requirements

- Use Zod for schema validation
- Implement type-safe configuration access
- Support multiple environments (development, staging, production)
- Validate all environment variables at startup
- Provide clear error messages for missing/invalid configs

### Environment Variables

```typescript
// Required variables
NEXT_PUBLIC_SUPABASE_URL: string
NEXT_PUBLIC_SUPABASE_ANON_KEY: string
SUPABASE_SERVICE_ROLE_KEY: string
NEXT_PUBLIC_APP_URL: string
OCR_API_KEY: string
FREEE_CLIENT_ID: string
FREEE_CLIENT_SECRET: string
FREEE_REDIRECT_URI: string

// Optional variables with defaults
LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' = 'info'
RATE_LIMIT_MAX_REQUESTS: number = 100
RATE_LIMIT_WINDOW_MS: number = 60000
```

### Code Patterns to Follow

- Use singleton pattern for configuration
- Implement lazy loading for sensitive configs
- Use TypeScript const assertions for type safety
- Follow 12-factor app configuration principles

## Acceptance Criteria

- [ ] All environment variables are validated at startup
- [ ] Missing required variables cause clear error messages
- [ ] Configuration is type-safe throughout the application
- [ ] Different environments load correct configurations
- [ ] Sensitive data is not exposed in client-side code

## Dependencies

- **Required**: PBI-1-1-1 - Basic environment setup must exist

## Testing Requirements

- Unit tests: Test configuration validation
- Integration tests: Test environment loading
- Test data: Mock environment configurations

## Estimate

1 story point

## Priority

High - Proper configuration is essential for all features

## Implementation Notes

- Use process.env only in configuration module
- Implement configuration caching for performance
- Consider using dotenv-vault for secret management
- Document all configuration options clearly
