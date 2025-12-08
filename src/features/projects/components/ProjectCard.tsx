import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types.ts'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { cn } from '../../../utils/cn.ts'

type ProjectCardProps = {
  project: Project
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate()

  const progress = useMemo(() => {
    if (!project.totalTasks) return 0
    return Math.min(100, Math.round((project.completedTasks / project.totalTasks) * 100))
  }, [project.completedTasks, project.totalTasks])

  const formattedDate = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(project.updatedAt)

  return (
    <article
      className={cn(
        'border-4 border-black bg-white p-5 rounded-none',
        'shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]',
        'flex flex-col gap-4 transition-transform duration-150',
        'hover:-translate-y-1 hover:-translate-x-1',
      )}
    >
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent-secondary">
          Actualizado: {formattedDate}
        </p>
        <h3 className="text-2xl font-black uppercase text-main">{project.name}</h3>
      </div>

      <div>
        <div className="flex justify-between text-sm font-mono text-main mb-2">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="border-3 border-black h-5 relative bg-neutral-100">
          <div
            className="absolute inset-y-0 left-0 bg-accent-success transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <BrutalButton variant="secondary" onClick={() => navigate(`/project/${project.id}/dashboard`)}>
        Abrir
      </BrutalButton>
    </article>
  )
}
