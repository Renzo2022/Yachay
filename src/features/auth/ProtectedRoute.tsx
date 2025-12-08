import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.tsx'

export const ProtectedRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main text-text-main font-mono text-xl">
        Verificando acceso...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
