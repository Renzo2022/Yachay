import type { ReactNode } from 'react'
import { AuthProvider } from '../../features/auth/AuthContext.tsx'
import { ToastProvider } from '../../core/toast/ToastProvider.tsx'

type AppProvidersProps = {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  // Future global providers (Firebase auth state, QueryClient, etc.) will be registered here.
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  )
}
