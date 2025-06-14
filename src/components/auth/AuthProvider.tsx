'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { sessionManager, type SessionData } from '@/lib/auth/session'
import type { AuthUser, AuthSession } from '@/lib/auth'

interface AuthContextType extends SessionData {
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessionData, setSessionData] = useState<SessionData>(() => 
    sessionManager.getSessionData()
  )

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((data) => {
      setSessionData(data)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { signIn: authSignIn } = await import('@/lib/auth')
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
      const { signUp: authSignUp } = await import('@/lib/auth')
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
      const { signOut: authSignOut } = await import('@/lib/auth')
      const { error } = await authSignOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw new Error(error.message)
      }
      
      await sessionManager.clearSession()
    } catch (error) {
      console.error('Sign out failed:', error)
      await sessionManager.clearSession()
      throw error
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      await sessionManager.refreshSession()
    } catch (error) {
      console.error('Session refresh failed:', error)
      throw error
    }
  }

  const contextValue: AuthContextType = {
    ...sessionData,
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