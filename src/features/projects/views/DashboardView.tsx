import { useEffect, useMemo, useState } from 'react'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { useAuth } from '../../auth/AuthContext.tsx'
import type { Project } from '../types.ts'
import { createProject, listenToProjects } from '../project.service.ts'
import { ProjectCard } from '../components/ProjectCard.tsx'
import { CreateProjectModal } from '../components/CreateProjectModal.tsx'
import { TemplateSelector } from '../components/TemplateSelector.tsx'
import type { GeneratedProtocolPayload } from '../../../services/ai.service.ts'

export const DashboardView = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToProjects(user.uid, (items) => {
      setProjects(items)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  if (!user) return null

  const handleCreateProject = async (name: string) => {
    await createProject(user.uid, { name })
  }

  const handleTemplateGenerated = async (templateId: string, payload: GeneratedProtocolPayload) => {
    await createProject(user.uid, {
      name: payload.topic,
      templateUsed: templateId,
      phase1: {
        mainQuestion: payload.protocol.mainQuestion,
        subquestions: [],
        objectives: '',
        pico: payload.protocol.pico,
        inclusionCriteria: payload.protocol.inclusionCriteria,
        exclusionCriteria: payload.protocol.exclusionCriteria,
      },
      completedTasks: 3,
    })
    setStatusMessage('Protocolo IA listo. Proyecto creado 🚀')
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const hasProjects = projects.length > 0
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt - a.updatedAt),
    [projects],
  )

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-mono uppercase tracking-[0.4em] text-accent-secondary">Fase 0 · Dashboard</p>
          <h1 className="text-4xl font-black uppercase">Centro de Proyectos</h1>
        </div>
        <div className="flex gap-3">
          <BrutalButton
            variant="secondary"
            className="bg-accent-secondary text-main border-black"
            onClick={() => setShowCreateModal(true)}
          >
            + Nuevo Proyecto
          </BrutalButton>
          <BrutalButton
            variant="danger"
            className="bg-accent-violet text-text-main border-black"
            onClick={() => setShowTemplateSelector(true)}
          >
            ✨ Usar Plantilla IA
          </BrutalButton>
        </div>
      </header>

      {statusMessage ? (
        <div className="border-4 border-black bg-accent-secondary text-main font-mono px-4 py-3 shadow-brutal">
          {statusMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="border-4 border-black border-dashed bg-neutral-900 text-text-main font-mono p-10 text-center">
          Cargando proyectos...
        </div>
      ) : hasProjects ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="border-4 border-dashed border-accent-secondary bg-neutral-900 text-center py-20 px-8 shadow-brutal flex flex-col gap-6">
          <h2 className="text-3xl font-black uppercase tracking-[0.3em] text-text-main">NO TIENES PROYECTOS</h2>
          <p className="text-text-main font-mono max-w-2xl mx-auto">
            Comienza una nueva revisión sistemática desde cero o deja que Yachay AI proponga un protocolo listo para
            accionar. Tu panel se poblará automáticamente.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <BrutalButton
              variant="secondary"
              className="bg-accent-secondary text-main border-black w-48"
              onClick={() => setShowCreateModal(true)}
            >
              + Nuevo Proyecto
            </BrutalButton>
            <BrutalButton
              variant="danger"
              className="bg-accent-violet text-text-main border-black w-48"
              onClick={() => setShowTemplateSelector(true)}
            >
              ✨ Usar Plantilla IA
            </BrutalButton>
          </div>
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />

      {showTemplateSelector ? (
        <TemplateSelector
          onClose={() => setShowTemplateSelector(false)}
          onTemplateGenerated={handleTemplateGenerated}
        />
      ) : null}
    </section>
  )
}
