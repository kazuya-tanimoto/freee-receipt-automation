'use client'

import { useAuthContext } from '@/components/auth/AuthProvider'
import type { AuthUser, AuthSession } from '@/lib/auth'

export interface UseAuthReturn {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const context = useAuthContext()
  
  return {
    user: context.user,
    session: context.session,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    signIn: context.signIn,
    signUp: context.signUp,
    signOut: context.signOut,
    refreshSession: context.refreshSession
  }
}

export function useUser(): AuthUser | null {
  const { user } = useAuth()
  return user
}

export function useSession(): AuthSession | null {
  const { session } = useAuth()
  return session
}

export function useAuthStatus(): {
  isLoading: boolean
  isAuthenticated: boolean
} {
  const { isLoading, isAuthenticated } = useAuth()
  return { isLoading, isAuthenticated }
}