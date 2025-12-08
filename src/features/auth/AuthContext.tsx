import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { logout, observeAuthState, resolveRedirectResult, signInWithGoogle } from './auth.service.ts'
import type { UserMetadata, IdTokenResult } from 'firebase/auth'

const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true'

const devMetadata: UserMetadata = {
  creationTime: new Date().toISOString(),
  lastSignInTime: new Date().toISOString(),
}

const devUser = {
  uid: 'dev-bypass',
  email: 'dev@local.test',
  displayName: 'Dev Bypass',
  emailVerified: true,
  isAnonymous: false,
  metadata: devMetadata,
  providerData: [],
  providerId: 'firebase',
  tenantId: null,
  phoneNumber: null,
  photoURL: null,
  reload: async () => {},
  delete: async () => {},
  refreshToken: 'dev-bypass-token',
  getIdToken: async () => 'dev-bypass-token',
  getIdTokenResult: async () =>
    ({
      token: 'dev-bypass-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
      signInProvider: 'custom',
      claims: {},
      signInSecondFactor: null,
    }) as IdTokenResult,
  toJSON: () => ({}),
} as User

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isBypass: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => (AUTH_BYPASS ? devUser : null))
  const [loading, setLoading] = useState(!AUTH_BYPASS)

  useEffect(() => {
    if (AUTH_BYPASS) {
      return
    }

    resolveRedirectResult().catch((error) => {
      console.error('Error al completar el redirect de Google', error)
    })

    const unsubscribe = observeAuthState((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isBypass: AUTH_BYPASS,
      signIn: async () => {
        if (AUTH_BYPASS) {
          setUser(devUser)
          return
        }
        await signInWithGoogle()
      },
      signOut: async () => {
        if (AUTH_BYPASS) {
          setUser(devUser)
          return
        }
        await logout()
      },
    }),
    [user, loading],
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main text-text-main font-mono text-xl">
        Sincronizando identidad...
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
