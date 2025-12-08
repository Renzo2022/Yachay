import { NavLink, Outlet } from 'react-router-dom'
import { BrutalButton } from '../ui-kit/BrutalButton.tsx'

const phases = [
  { path: '/', label: 'F0 — Projects' },
  { path: '/phase1', label: 'F1 — Planning' },
  { path: '/phase2', label: 'F2 — Search' },
  { path: '/phase3', label: 'F3 — Screening' },
  { path: '/phase4', label: 'F4 — Quality' },
  { path: '/phase5', label: 'F5 — Extraction' },
  { path: '/phase6', label: 'F6 — Synthesis' },
  { path: '/phase7', label: 'F7 — Report' },
]

export const AppLayout = () => (
  <div className="min-h-screen bg-main text-text-main flex flex-col">
    <header className="border-b-4 border-white bg-main px-6 py-4 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent-secondary">Yachay AI</span>
        <h1 className="text-2xl font-bold">Systematic Review Command Center</h1>
      </div>
      <BrutalButton variant="secondary" className="hidden sm:inline-flex">
        Sync Firebase
      </BrutalButton>
    </header>

    <nav className="bg-neutral-100 text-main border-b-4 border-black px-4 py-3 flex flex-wrap gap-2">
      {phases.map((phase) => (
        <NavLink
          key={phase.path}
          to={phase.path}
          className={({ isActive }) =>
            [
              'px-3 py-2 border-3 border-black font-mono text-xs uppercase tracking-tight transition-all',
              'shadow-[3px_3px_0px_0px_#000000]',
              isActive ? 'bg-accent-secondary text-main' : 'bg-white hover:-translate-y-0.5 hover:-translate-x-0.5',
            ].join(' ')
          }
        >
          {phase.label}
        </NavLink>
      ))}
    </nav>

    <main className="flex-1 px-6 py-8">
      <div className="max-w-6xl mx-auto border-4 border-white bg-neutral-900 shadow-brutal p-6">
        <Outlet />
      </div>
    </main>
  </div>
)
