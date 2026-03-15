"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof import("@/lib/supabase/client").createClient> | null>(null)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setIsLoading(false)
      return
    }

    // Dynamically import and create Supabase client only when configured
    const initSupabase = async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const client = createClient()
      setSupabase(client)

      // Get initial session
      const { data: { session } } = await client.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Listen for auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    initSupabase()
  }, [configured])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase is not configured. Please connect Supabase integration.")
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error("Error signing in with Google:", error)
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase is not configured.")
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isConfigured: configured, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
