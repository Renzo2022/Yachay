import { BrutalButton } from '../../core/ui-kit/BrutalButton.tsx'
import { BrutalCard } from '../../core/ui-kit/BrutalCard.tsx'
import { useAuth } from './AuthContext.tsx'

export const LoginView = () => {
  const { signIn } = useAuth()

  return (
    <div className="min-h-screen bg-main text-text-main flex items-center justify-center px-4">
      <BrutalCard
        title={
          <div className="flex flex-col gap-1">
            <span className="text-sm font-mono tracking-[0.4em] text-accent-secondary">YACHAY AI</span>
            <span className="text-4xl font-extrabold">Gestión de Revisiones Sistemáticas</span>
          </div>
        }
        className="max-w-lg w-full bg-neutral-100"
      >
        <p className="text-main mb-6 font-mono">
          Automatiza PICO, cribado, extracción y síntesis apoyado por IA Groq + Firebase. Accede con tu cuenta institucional.
        </p>
        <BrutalButton className="w-full justify-center" variant="primary" size="md" onClick={() => signIn()}>
          Entrar con Google
        </BrutalButton>
      </BrutalCard>
    </div>
  )
}
