import { supabase } from '@/lib/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export type AuthUser = User
export type AuthSession = Session
export type AuthResponse = {
  user: AuthUser | null
  session: AuthSession | null
  error?: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const { email, password, name } = data
  
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || null
      }
    }
  })

  if (error) {
    return { user: null, session: null, error }
  }

  return {
    user: authData.user,
    session: authData.session,
    error: null
  }
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  const { email, password } = data
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { user: null, session: null, error }
  }

  return {
    user: authData.user,
    session: authData.session,
    error: null
  }
}

export async function signOut(): Promise<{ error?: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function refreshSession(): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.refreshSession()
  
  if (error) {
    return { user: null, session: null, error }
  }

  return {
    user: data.user,
    session: data.session,
    error: null
  }
}

export function onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function resetPassword(email: string): Promise<{ error?: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  
  return { error }
}

export async function updatePassword(password: string): Promise<{ error?: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({ password })
  return { error }
}

export function isAuthenticated(session: AuthSession | null): boolean {
  if (!session) return false
  
  const now = Math.floor(Date.now() / 1000)
  return session.expires_at ? session.expires_at > now : true
}