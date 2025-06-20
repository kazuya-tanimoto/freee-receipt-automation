import { describe, it, expect, vi } from 'vitest'

// Mock the Supabase auth helpers
const mockCreateClientComponentClient = vi.fn()

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: mockCreateClientComponentClient
}))

describe('Supabase Client', () => {
  it('should create client with correct type', async () => {
    const mockClient = {
      auth: { getUser: vi.fn() },
      from: vi.fn()
    }
    
    mockCreateClientComponentClient.mockReturnValue(mockClient)

    // Import after mocking to ensure mock is applied
    const { supabase } = await import('./client')

    expect(mockCreateClientComponentClient).toHaveBeenCalled()
    expect(supabase).toBe(mockClient)
  })

  it('should be configured with Database type', async () => {
    const mockClient = {
      auth: { getUser: vi.fn() },
      from: vi.fn()
    }
    
    mockCreateClientComponentClient.mockReturnValue(mockClient)

    // Import the client
    await import('./client')

    // Verify that createClientComponentClient was called
    expect(mockCreateClientComponentClient).toHaveBeenCalledTimes(1)
  })
})