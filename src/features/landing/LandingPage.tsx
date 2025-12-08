import { Link } from 'react-router-dom'
import { BrutalButton } from '../../core/ui-kit/BrutalButton.tsx'

export const LandingPage = () => (
  <div className="min-h-screen bg-[#111111] text-white flex flex-col">
    <header className="border-b-4 border-white px-8 py-6 flex items-center justify-between">
      <h1 className="text-4xl font-black tracking-[0.4em]">YACHAY AI</h1>
      <Link to="/login">
        <BrutalButton variant="primary" className="bg-[#EF4444] text-white text-lg px-6 py-3">
          Empezar ahora
        </BrutalButton>
      </Link>
    </header>

    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="text-sm font-mono uppercase tracking-[0.6em] text-[#EF4444]">Revisiones Sistemáticas Brutalmente Eficientes</p>
      <h2 className="text-6xl font-black max-w-3xl leading-tight">
        Orquesta cada fase PRISMA con IA, controles neo-brutalistas y métricas en tiempo real.
      </h2>
      <p className="text-lg font-mono max-w-2xl text-neutral-200">
        Desde el protocolo PICO hasta el manuscrito final, Yachay AI automatiza tu pipeline de investigación académica
        con precisión quirúrgica.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/login">
          <BrutalButton variant="primary" className="bg-[#EF4444] text-white text-lg px-8 py-4">
            Empezar ahora
          </BrutalButton>
        </Link>
        <Link to="/login">
          <BrutalButton variant="secondary" className="bg-white text-black border-black text-lg px-8 py-4">
            Ver demo
          </BrutalButton>
        </Link>
      </div>
    </main>

    <footer className="border-t-4 border-white px-8 py-4 text-sm font-mono text-neutral-300">
      © {new Date().getFullYear()} Yachay AI · Made in Ecuador
    </footer>
  </div>
)
