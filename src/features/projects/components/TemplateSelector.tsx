import { useState } from 'react'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { generateProtocolFromTemplate, type GeneratedProtocolPayload } from '../../../services/ai.service.ts'

const templates = [
  {
    id: 'llm-argumentacion',
    title: 'Evaluación de Argumentación con LLMs',
    domain: 'CS · Educación',
    description: 'Analiza el impacto de modelos de lenguaje en la evaluación automática de ensayos y debates.',
  },
  {
    id: 'stem-tech',
    title: 'Tecnologías Educativas en STEM',
    domain: 'Educación',
    description: 'Identifica qué plataformas digitales potencian el aprendizaje práctico en ciencias y matemáticas.',
  },
  {
    id: 'salud-mental',
    title: 'Intervenciones en Salud Mental',
    domain: 'Psicología',
    description: 'Evalúa la eficacia de terapias digitales y telepsicología en jóvenes universitarios.',
  },
]

type TemplateSelectorProps = {
  onTemplateGenerated: (templateId: string, payload: GeneratedProtocolPayload) => void
  onClose: () => void
}

export const TemplateSelector = ({ onTemplateGenerated, onClose }: TemplateSelectorProps) => {
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null)

  const handleSelect = async (templateId: string, topic: string) => {
    setLoadingTemplate(templateId)
    const payload = await generateProtocolFromTemplate(topic)
    onTemplateGenerated(templateId, payload)
    setLoadingTemplate(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-6 items-center justify-center px-4 py-10">
      <div className="self-end">
        <BrutalButton variant="secondary" size="sm" onClick={onClose}>
          Cerrar
        </BrutalButton>
      </div>
      <div className="w-full max-w-5xl grid gap-6 md:grid-cols-3">
        {templates.map((template) => (
          <BrutalCard key={template.id} className="bg-neutral-100" title={template.domain}>
            <div className="space-y-4">
              <h4 className="text-2xl font-black uppercase text-main">{template.title}</h4>
              <p className="text-sm text-main">{template.description}</p>
              <BrutalButton
                variant="primary"
                className="w-full justify-center"
                onClick={() => handleSelect(template.id, template.title)}
                disabled={Boolean(loadingTemplate)}
              >
                {loadingTemplate === template.id ? '🤖 IA trabajando...' : 'Usar Plantilla'}
              </BrutalButton>
              {loadingTemplate === template.id ? (
                <div className="w-10 h-10 border-3 border-black bg-accent-secondary animate-square-blink mx-auto" />
              ) : null}
            </div>
          </BrutalCard>
        ))}
      </div>
    </div>
  )
}
