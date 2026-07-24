import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role?: 'admin' | 'teacher' | 'parent' | 'student'
  status?: 'pending' | 'approved' | 'rejected'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  profileError: string | null
  signUp: (email: string, password: string, userData: { first_name?: string; last_name?: string; role: string }) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

import { ROLE_ID_TO_APP_ROLE } from '@/lib/normalize-role'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const { toast } = useToast()
  const profileFetchId = useRef(0)

  const fetchUserProfile = useCallback(async (userId: string, email: string) => {
    const fetchId = ++profileFetchId.current
    setProfileLoading(true)
    setProfileError(null)

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Délai de chargement du profil dépassé')), 12000)
      )

      const loadProfile = async () => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, role_id')
          .eq('user_id', userId)
          .maybeSingle()

        if (profileError) throw profileError
        if (!profile) return null

        let approvalStatus: string | null = null
        try {
          const { data: rpcStatus, error: approvalError } = await supabase.rpc(
            'get_user_approval_status',
            { user_uuid: userId }
          )
          if (!approvalError) approvalStatus = rpcStatus
        } catch {
          // RPC optional — derive status from role_id
        }

        const roleName = profile.role_id ? ROLE_ID_TO_APP_ROLE[profile.role_id] : undefined

        return {
          id: profile.id,
          email,
          first_name: profile.first_name ?? undefined,
          last_name: profile.last_name ?? undefined,
          role: roleName,
          status: (approvalStatus || (roleName ? 'approved' : 'pending')) as UserProfile['status'],
        } satisfies UserProfile
      }

      const profile = await Promise.race([loadProfile(), timeout])

      if (fetchId !== profileFetchId.current) return

      setUserProfile(profile)
      if (!profile) {
        setProfileError('Aucun profil associé à ce compte.')
      }
    } catch (error) {
      if (fetchId !== profileFetchId.current) return
      console.error('Error in fetchUserProfile:', error)
      setUserProfile(null)
      setProfileError(error instanceof Error ? error.message : 'Impossible de charger le profil')
    } finally {
      if (fetchId === profileFetchId.current) {
        setProfileLoading(false)
      }
    }
  }, [])

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id, user.email ?? '')
    }
  }

  useEffect(() => {
    let mounted = true

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        // Ne pas await ici — évite le deadlock Supabase auth
        void fetchUserProfile(nextSession.user.id, nextSession.user.email ?? '')
      } else {
        setUserProfile(null)
        setProfileLoading(false)
        setProfileError(null)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
      if (mounted) setLoading(false)
    })

    supabase.auth
      .getSession()
      .then(({ data: { session: existing } }) => {
        if (!mounted) return
        applySession(existing)
        setLoading(false)
      })
      .catch((error) => {
        console.error('getSession error:', error)
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signUp = async (
    email: string,
    password: string,
    userData: { first_name?: string; last_name?: string; role: string }
  ) => {
    try {
      if (!['student', 'parent'].includes(userData.role)) {
        toast({
          variant: 'destructive',
          title: "Erreur d'inscription",
          description: "L'inscription est limitée aux étudiants et parents uniquement.",
        })
        return { error: new Error('Invalid role for signup') }
      }

      const redirectUrl = `${window.location.origin}/`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
          },
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: "Erreur d'inscription",
          description: error.message,
        })
        return { error }
      }

      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email,
            requested_role: userData.role,
          } as Record<string, unknown>)
          .eq('user_id', data.user.id)
      }

      toast({
        title: 'Inscription réussie',
        description: 'Votre compte est en attente de validation par un administrateur.',
      })

      return { error: null }
    } catch (error) {
      console.error('Error in signUp:', error)
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur de connexion',
          description: error.message,
        })
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in signIn:', error)
      return { error: error as Error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur de connexion',
          description: error.message,
        })
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error)
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: 'Une erreur est survenue lors de la connexion avec Google.',
      })
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserProfile(null)
      setProfileError(null)

      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      })
      
      // Clean the URL and reset application state
      window.location.replace('/')
    } catch (error) {
      console.error('Error in signOut:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        profileLoading,
        profileError,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
