import { describe, it, expect } from 'vitest'

describe('Testing Framework Setup', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('http://localhost:54321')
  })
})