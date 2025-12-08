import { Navigate, useLocation } from 'react-router-dom'
import { BrutalButton } from '../../core/ui-kit/BrutalButton.tsx'
import { BrutalCard } from '../../core/ui-kit/BrutalCard.tsx'
import { useAuth } from './AuthContext.tsx'

export const LoginView = () => {
  const { signIn, user } = useAuth()
  const location = useLocation()

  if (user) {
    const redirect = location.state?.from?.pathname ?? '/'
    return <Navigate to={redirect} replace />
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex items-center justify-center px-4">
      <BrutalCard
        title={
          <div className="flex flex-col gap-1 text-neutral-900">
            <span className="text-sm font-mono tracking-[0.4em] text-neutral-900">YACHAY AI</span>
            <span className="text-4xl font-extrabold text-neutral-900">Gestión de Revisiones Sistemáticas</span>
          </div>
        }
        className="max-w-lg w-full bg-white border-4 border-black"
      >
        <p className="text-neutral-900 mb-6 font-mono">
          Automatiza PICO, cribado, extracción y síntesis apoyado por IA Groq + Firebase. Accede con tu cuenta institucional.
        </p>
        <BrutalButton
          className="w-full justify-center bg-accent-primary text-white"
          variant="primary"
          size="md"
          onClick={() => signIn()}
        >
          Entrar con Google
        </BrutalButton>
      </BrutalCard>
    </div>
  )
}
