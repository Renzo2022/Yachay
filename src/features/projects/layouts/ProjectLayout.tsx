import { useMemo } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { ProjectProvider } from '../ProjectContext.tsx'
import type { PhaseKey } from '../types.ts'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { phaseMetadata } from '../phaseMetadata.ts'
import { useProjectProgress } from '../hooks/useProjectProgress.ts'

const phaseEntries = Object.entries(phaseMetadata) as [PhaseKey, (typeof phaseMetadata)[PhaseKey]][]

export const ProjectLayout = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { project, loading, progressPercent, phaseProgress, currentPhase } = useProjectProgress(projectId)

  const currentPhaseLabel = useMemo(() => phaseMetadata[currentPhase]?.label ?? 'Fase', [currentPhase])

  if (loading) {
    return (
      <div className="min-h-screen bg-main text-text-main flex items-center justify-center font-mono text-xl">
        Cargando proyecto...
      </div>
    )
  }

  if (!project || !projectId) {
    return (
      <div className="min-h-screen bg-main text-text-main flex flex-col items-center justify-center gap-4 font-mono">
        <p>No encontramos este proyecto.</p>
        <Link to="/dashboard" className="text-accent-secondary underline">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  const getPhaseState = (phaseKey: PhaseKey) => {
    const phase = phaseProgress[phaseKey]
    if (phase.completed >= phase.total) return 'done'
    if (phaseKey === currentPhase) return 'active'
    return 'locked'
  }

  return (
    <ProjectProvider value={{ project }}>
      <div className="min-h-screen bg-main text-text-main">
        <header className="border-b-4 border-white px-8 py-6 bg-main">
          <div className="flex flex-col gap-3">
            <nav className="text-sm font-mono uppercase tracking-[0.3em] text-accent-secondary flex flex-wrap gap-2">
              <Link to="/dashboard" className="underline">
                Dashboard
              </Link>
              <span>›</span>
              <span>{project.name}</span>
              <span>›</span>
              <span>{currentPhaseLabel}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase">{project.name}</h1>
                <p className="font-mono text-sm text-neutral-100">ID: {project.id}</p>
              </div>
              <div className="flex-1 min-w-[240px]">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-100">Progreso global</p>
                <div className="border-3 border-white h-4 relative bg-neutral-900">
                  <div className="absolute inset-y-0 left-0 bg-accent-secondary" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs font-mono mt-1">{progressPercent}% completado</p>
              </div>
              <BrutalButton variant="secondary" disabled className="opacity-50 cursor-not-allowed">
                Exportar
              </BrutalButton>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="w-72 border-r-4 border-white bg-neutral-100 text-main min-h-[calc(100vh-160px)] p-6 space-y-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 border-3 border-black px-3 py-2 font-mono text-sm bg-white hover:-translate-y-1 hover:-translate-x-1 transition-transform"
            >
              🔙 Volver al dashboard
            </Link>
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-900">Fases</h2>
            <nav className="flex flex-col gap-3">
              {phaseEntries.map(([phaseKey, metadata]) => {
                const state = getPhaseState(phaseKey)
                const icon =
                  state === 'done' ? '✅' : state === 'active' ? '🔵' : '🔒'
                const destination = `/project/${projectId}/${metadata.route}`

                return (
                  <NavLink
                    key={phaseKey}
                    to={destination}
                    className={({ isActive }) =>
                      [
                        'flex items-center justify-between border-3 border-black px-4 py-3 font-mono text-sm uppercase transition-transform',
                        'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                        isActive ? 'bg-black text-white' : 'bg-white hover:-translate-y-1 hover:-translate-x-1',
                      ].join(' ')
                    }
                  >
                    <span>{metadata.label}</span>
                    <span className={state === 'done' ? 'text-green-600' : state === 'active' ? 'text-blue-600' : 'text-neutral-500'}>
                      {icon}
                    </span>
                  </NavLink>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ProjectProvider>
  )
}
