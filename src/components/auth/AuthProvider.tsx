'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser, AuthSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

// 事前ロード
const authModule = import('@/lib/auth')

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { signIn: authSignIn } = await authModule
      const { error } = await authSignIn({ email, password })
      
      if (error) {
        return { error: error.message }
      }
      
      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred during sign in' }
    }
  }

  const signUp = async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
    try {
      const { signUp: authSignUp } = await authModule
      const { error } = await authSignUp({ email, password, name })
      
      if (error) {
        return { error: error.message }
      }
      
      return {}
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'An unexpected error occurred during sign up' }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { signOut: authSignOut } = await authModule
      const { error } = await authSignOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw new Error(error.message)
      }
      
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
    } catch (error) {
      console.error('Session refresh failed:', error)
      throw error
    }
  }

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}