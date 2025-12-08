import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { ProjectProvider } from '../ProjectContext.tsx'
import type { Project } from '../types.ts'
import { listenToProject } from '../project.service.ts'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'

const phaseNav = [
  { path: 'phase1', label: 'F1 · Planificación' },
  { path: 'phase2', label: 'F2 · Búsqueda' },
  { path: 'phase3', label: 'F3 · Cribado' },
  { path: 'phase4', label: 'F4 · Calidad' },
  { path: 'phase5', label: 'F5 · Extracción' },
  { path: 'phase6', label: 'F6 · Síntesis' },
  { path: 'phase7', label: 'F7 · Reporte' },
]

export const ProjectLayout = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    const unsubscribe = listenToProject(projectId, (data) => {
      setProject(data)
      setLoading(false)
    })
    return unsubscribe
  }, [projectId])

  const currentPhaseLabel = useMemo(() => {
    const phase = phaseNav.find((entry) => location.pathname.includes(entry.path))
    return phase?.label ?? 'Fase'
  }, [location.pathname])

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
        <Link to="/" className="text-accent-secondary underline">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  const progress = Math.round((project.completedTasks / project.totalTasks) * 100)

  return (
    <ProjectProvider value={{ project }}>
      <div className="min-h-screen bg-main text-text-main">
        <header className="border-b-4 border-white px-8 py-6 bg-main">
          <div className="flex flex-col gap-3">
            <nav className="text-sm font-mono uppercase tracking-[0.3em] text-accent-secondary flex flex-wrap gap-2">
              <Link to="/" className="underline">
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
                  <div className="absolute inset-y-0 left-0 bg-accent-secondary" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs font-mono mt-1">{progress}% completado</p>
              </div>
              <BrutalButton variant="secondary" disabled className="opacity-50 cursor-not-allowed">
                Exportar
              </BrutalButton>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="w-72 border-r-4 border-white bg-neutral-100 text-main min-h-[calc(100vh-160px)] p-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-neutral-900">Fases</h2>
            <nav className="flex flex-col gap-3">
              {phaseNav.map((phase, index) => {
                const isActive = location.pathname.includes(phase.path)
                const phaseProgress = ((index + 1) / phaseNav.length) * 100
                const isCompleted = progress >= phaseProgress

                return (
                  <NavLink
                    key={phase.path}
                    to={`/project/${projectId}/${phase.path}`}
                    className={({ isActive: navActive }) =>
                      [
                        'flex items-center justify-between border-3 border-black px-4 py-3 font-mono text-sm uppercase transition-transform',
                        'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                        navActive || isActive
                          ? 'bg-accent-primary text-text-main'
                          : 'bg-white hover:-translate-y-1 hover:-translate-x-1',
                      ].join(' ')
                    }
                  >
                    <span>{phase.label}</span>
                    <span className={isCompleted ? 'text-accent-success' : 'text-neutral-500'}>
                      {isCompleted ? '✔' : '○'}
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
