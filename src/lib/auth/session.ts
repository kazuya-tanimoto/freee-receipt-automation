import { supabase } from '@/lib/supabase/client'
import type { AuthSession, AuthUser } from './index'

export interface SessionData {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
}

export class SessionManager {
  private static instance: SessionManager
  private sessionData: SessionData = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  }
  private listeners: Set<(data: SessionData) => void> = new Set()

  private constructor() {
    this.initialize()
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private async initialize(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session initialization error:', error)
        this.updateSessionData({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false
        })
        return
      }

      this.updateSessionData({
        user: session?.user || null,
        session,
        isLoading: false,
        isAuthenticated: this.isValidSession(session)
      })

      supabase.auth.onAuthStateChange((event, session) => {
        this.handleAuthStateChange(event, session)
      })
    } catch (error) {
      console.error('Session manager initialization failed:', error)
      this.updateSessionData({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  private handleAuthStateChange(event: string, session: AuthSession | null): void {
    console.log('Auth state changed:', event, session?.user?.email)
    
    this.updateSessionData({
      user: session?.user || null,
      session,
      isLoading: false,
      isAuthenticated: this.isValidSession(session)
    })
  }

  private isValidSession(session: AuthSession | null): boolean {
    if (!session) return false
    
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at
    
    if (!expiresAt) return true
    
    return expiresAt > now
  }

  private updateSessionData(newData: SessionData): void {
    this.sessionData = { ...newData }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.sessionData)
      } catch (error) {
        console.error('Session listener error:', error)
      }
    })
  }

  public getSessionData(): SessionData {
    return { ...this.sessionData }
  }

  public subscribe(listener: (data: SessionData) => void): () => void {
    this.listeners.add(listener)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  public async refreshSession(): Promise<void> {
    try {
      this.updateSessionData({ ...this.sessionData, isLoading: true })
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        this.updateSessionData({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false
        })
        return
      }

      this.updateSessionData({
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: this.isValidSession(data.session)
      })
    } catch (error) {
      console.error('Session refresh failed:', error)
      this.updateSessionData({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  public async clearSession(): Promise<void> {
    this.updateSessionData({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false
    })
  }
}

export const sessionManager = SessionManager.getInstance()

export function getSessionData(): SessionData {
  return sessionManager.getSessionData()
}

export function subscribeToSession(listener: (data: SessionData) => void): () => void {
  return sessionManager.subscribe(listener)
}

export async function refreshCurrentSession(): Promise<void> {
  return sessionManager.refreshSession()
}

export async function clearCurrentSession(): Promise<void> {
  return sessionManager.clearSession()
}