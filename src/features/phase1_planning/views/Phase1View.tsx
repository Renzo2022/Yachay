import { useEffect, useState } from 'react'
import { AIGeneratorPanel } from '../components/AIGeneratorPanel.tsx'
import { PicoGrid } from '../components/PicoGrid.tsx'
import { PhaseChecklist } from '../components/PhaseChecklist.tsx'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import { BrutalInput } from '../../../core/ui-kit/BrutalInput.tsx'
import { usePhase1 } from '../hooks/usePhase1.ts'
import { generatePhase1Protocol } from '../../../services/ai.service.ts'
import { useProject } from '../../projects/ProjectContext.tsx'

export const Phase1View = () => {
  const project = useProject()
  const {
    data,
    updateField,
    updatePicoField,
    updateListField,
    getListTextValue,
    applyAiProtocol,
    aiBadgeFor,
    isSaving,
    lastSavedAt,
    completionChecklist,
  } = usePhase1()

  const [toastVisible, setToastVisible] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (lastSavedAt) {
      setToastVisible(true)
      const timer = setTimeout(() => setToastVisible(false), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [lastSavedAt])

  const handleAiGenerate = async (topic: string) => {
    setAiLoading(true)
    const payload = await generatePhase1Protocol(topic)
    applyAiProtocol(payload)
    setAiLoading(false)
  }

  const checklistItems = [
    { id: 'mainQuestion', label: 'Definir pregunta principal (PICO completo)', completed: completionChecklist.mainQuestion },
    { id: 'subquestions', label: 'Generar subpreguntas derivadas (3 a 5)', completed: completionChecklist.subquestions },
    { id: 'coherence', label: 'Validar coherencia entre preguntas', completed: completionChecklist.coherence },
    { id: 'justification', label: 'Definir objetivos y justificación', completed: completionChecklist.justification },
    { id: 'criteria', label: 'Definir criterios de inclusión/exclusión', completed: completionChecklist.criteria },
  ]

  return (
    <div className="space-y-8">
      <AIGeneratorPanel initialTopic={data.mainQuestion || project.name} onGenerate={handleAiGenerate} />

      <section className="grid lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)] gap-6">
        <div className="space-y-6">
          <BrutalCard className="bg-neutral-100" title="Pregunta principal" titleClassName="text-black">
            <BrutalInput
              multiline
              value={data.mainQuestion}
              onChange={(event) => updateField('mainQuestion', event.target.value)}
              badge={aiBadgeFor('mainQuestion') ? '🤖 IA' : undefined}
            />
          </BrutalCard>

          <BrutalCard className="bg-neutral-100" title="Subpreguntas clave" titleClassName="text-black">
            <BrutalInput
              multiline
              value={getListTextValue('subquestions')}
              onChange={(event) => updateListField('subquestions', event.target.value)}
              badge={aiBadgeFor('subquestions') ? '🤖 IA' : undefined}
            />
            <p className="mt-2 font-mono text-xs text-main">Recuerda mantener entre 3 y 5 subpreguntas.</p>
          </BrutalCard>

          <PicoGrid pico={data.pico} onChange={updatePicoField} aiBadgeFor={aiBadgeFor} />

          <BrutalCard className="bg-neutral-100" title="Objetivos de la revisión" titleClassName="text-black">
            <BrutalInput
              multiline
              value={data.objectives}
              onChange={(event) => updateField('objectives', event.target.value)}
              badge={aiBadgeFor('objectives') ? '🤖 IA' : undefined}
            />
          </BrutalCard>

          <BrutalCard className="bg-neutral-100" title="Validación de coherencia" titleClassName="text-black">
            <BrutalInput
              multiline
              value={data.coherenceAnalysis}
              onChange={(event) => updateField('coherenceAnalysis', event.target.value)}
              badge={aiBadgeFor('coherenceAnalysis') ? '🤖 IA' : undefined}
            />
          </BrutalCard>

          <BrutalCard className="bg-neutral-100" title="Justificación metodológica" titleClassName="text-black">
            <BrutalInput
              multiline
              value={data.methodologicalJustification}
              onChange={(event) => updateField('methodologicalJustification', event.target.value)}
              badge={aiBadgeFor('methodologicalJustification') ? '🤖 IA' : undefined}
            />
          </BrutalCard>

          <div className="grid md:grid-cols-2 gap-4">
            <BrutalCard className="bg-neutral-100" title="Criterios de inclusión" titleClassName="text-accent-success">
              <BrutalInput
                multiline
                value={getListTextValue('inclusionCriteria')}
                onChange={(event) => updateListField('inclusionCriteria', event.target.value)}
                badge={aiBadgeFor('inclusionCriteria') ? '🤖 IA' : undefined}
              />
            </BrutalCard>
            <BrutalCard className="bg-neutral-100" title="Criterios de exclusión" titleClassName="text-accent-danger">
              <BrutalInput
                multiline
                value={getListTextValue('exclusionCriteria')}
                onChange={(event) => updateListField('exclusionCriteria', event.target.value)}
                badge={aiBadgeFor('exclusionCriteria') ? '🤖 IA' : undefined}
              />
            </BrutalCard>
          </div>
        </div>

        <div className="space-y-6">
          <PhaseChecklist items={checklistItems} />
          <div className="border-4 border-black bg-neutral-100 shadow-brutal p-5">
            <h4 className="text-xl font-black uppercase text-main mb-3">Tips de fase</h4>
            <ul className="list-disc list-inside font-mono text-sm text-main space-y-2">
              <li>Sincroniza tu pregunta con los criterios PICO para evitar sesgos.</li>
              <li>Documenta las fuentes de cada decisión (IA, expertos, literatura).</li>
              <li>Revisa que los criterios sean replicables y medibles.</li>
            </ul>
          </div>
        </div>
      </section>

      {(isSaving || aiLoading || toastVisible) && (
        <div className="fixed bottom-6 right-6 border-4 border-black bg-neutral-100 text-main font-mono px-5 py-3 shadow-brutal">
          {isSaving ? '💾 Guardando...' : toastVisible ? '💾 Guardado' : aiLoading ? '🤖 IA aplicada' : null}
        </div>
      )}
    </div>
  )
}
