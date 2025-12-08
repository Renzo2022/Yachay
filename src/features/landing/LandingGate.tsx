import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.tsx'
import { LandingPage } from './LandingPage.tsx'

export const LandingGate = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center font-mono text-xl">
        Verificando acceso...
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <LandingPage />
}
