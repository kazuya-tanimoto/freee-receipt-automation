import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client - define mock object at top level
const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
}

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: mockAuth
  }
}))

describe('Auth Functions', () => {
  // Import after mocking
  let authModule: typeof import('../index')

  beforeEach(async () => {
    vi.clearAllMocks()
    authModule = await import('../index')
  })

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' }
      const mockSession = { access_token: 'test-token', expires_at: Date.now() + 3600 }
      
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authModule.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: 'Test User' }
        }
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already exists' }
      
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authModule.signUp({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' }
      const mockSession = { access_token: 'test-token', expires_at: Date.now() + 3600 }
      
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authModule.signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid credentials' }
      
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authModule.signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null })

      const result = await authModule.signOut()

      expect(result.error).toBeNull()
      expect(mockAuth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Network error' }
      mockAuth.signOut.mockResolvedValue({ error: mockError })

      const result = await authModule.signOut()

      expect(result.error).toEqual(mockError)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' }
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser }
      })

      const result = await authModule.getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null when no user', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null }
      })

      const result = await authModule.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('getCurrentSession', () => {
    it('should return current session', async () => {
      const mockSession = { access_token: 'test-token', expires_at: Date.now() + 3600 }
      
      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession }
      })

      const result = await authModule.getCurrentSession()

      expect(result).toEqual(mockSession)
    })

    it('should return null when no session', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null }
      })

      const result = await authModule.getCurrentSession()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true for valid session', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const session = { 
        access_token: 'test-token', 
        expires_at: futureTime 
      } as any

      expect(authModule.isAuthenticated(session)).toBe(true)
    })

    it('should return false for expired session', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const session = { 
        access_token: 'test-token', 
        expires_at: pastTime 
      } as any

      expect(authModule.isAuthenticated(session)).toBe(false)
    })

    it('should return false for null session', () => {
      expect(authModule.isAuthenticated(null)).toBe(false)
    })

    it('should return true for session without expiry', () => {
      const session = { 
        access_token: 'test-token'
      } as any

      expect(authModule.isAuthenticated(session)).toBe(true)
    })
  })
})