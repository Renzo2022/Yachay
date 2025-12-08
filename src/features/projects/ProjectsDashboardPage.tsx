import { BrutalButton } from '../../core/ui-kit/BrutalButton.tsx'

const featuredProjects = [
  {
    id: 'pico-covid',
    name: 'COVID-19 Telemedicine Outcomes',
    owner: 'Dr. Q. Morales',
    status: 'Phase 1 · Planning',
    updatedAt: '2025-12-01',
    progress: 32,
  },
  {
    id: 'oncology-ai',
    name: 'AI in Oncology Diagnostics',
    owner: 'Ing. L. Villacís',
    status: 'Phase 3 · Screening',
    updatedAt: '2025-11-28',
    progress: 58,
  },
]

const pipeline = [
  { label: 'Candidates harvested', value: 1420, accent: 'bg-accent-secondary text-main' },
  { label: 'Screened papers', value: 610, accent: 'bg-accent-success text-main' },
  { label: 'Included studies', value: 128, accent: 'bg-accent-warning text-main' },
]

export const ProjectsDashboardPage = () => (
  <section className="space-y-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-mono uppercase text-accent-secondary tracking-[0.4em]">Fase 0 · Control</p>
        <h2 className="text-4xl font-extrabold">Panel Maestro de RSL</h2>
      </div>
      <div className="flex gap-3">
        <BrutalButton variant="secondary" className="border-black bg-neutral-100 text-main" size="sm">
          Importar desde CSV
        </BrutalButton>
        <BrutalButton variant="primary">Nuevo Proyecto</BrutalButton>
      </div>
    </header>

    <div className="grid gap-4 md:grid-cols-3">
      {pipeline.map((item) => (
        <article
          key={item.label}
          className={`border-4 border-black ${item.accent} p-4 shadow-brutal flex flex-col justify-between`}
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em]">{item.label}</span>
          <strong className="text-4xl font-extrabold">{item.value}</strong>
        </article>
      ))}
    </div>

    <div className="border-4 border-white bg-main shadow-brutal">
      <header className="flex items-center justify-between border-b-4 border-white px-6 py-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent-secondary">Mapeo de Proyectos</p>
          <h3 className="text-2xl font-bold">Pipeline activo</h3>
        </div>
        <BrutalButton variant="secondary" size="sm">
          Ver todos
        </BrutalButton>
      </header>
      <div className="divide-y-4 divide-white">
        {featuredProjects.map((project) => (
          <article key={project.id} className="px-6 py-5 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="text-sm font-mono uppercase text-accent-secondary tracking-[0.2em]">#{project.id}</p>
              <h4 className="text-xl font-semibold">{project.name}</h4>
              <p className="text-sm text-neutral-100">Líder: {project.owner}</p>
            </div>
            <div className="flex flex-col gap-2 md:w-64">
              <div className="flex justify-between text-sm font-mono">
                <span>{project.status}</span>
                <span>{project.progress}%</span>
              </div>
              <div className="border-3 border-white h-4 relative">
                <div className="absolute inset-0 bg-accent-primary" style={{ width: `${project.progress}%` }} />
              </div>
              <p className="text-xs font-mono uppercase text-neutral-100">Updated {project.updatedAt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)
