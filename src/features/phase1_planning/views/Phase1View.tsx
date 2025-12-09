import { useEffect, useState } from 'react'
import { AIGeneratorPanel } from '../components/AIGeneratorPanel.tsx'
import { PicoGrid } from '../components/PicoGrid.tsx'
import { PhaseChecklist } from '../components/PhaseChecklist.tsx'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import { BrutalInput } from '../../../core/ui-kit/BrutalInput.tsx'
import { SubquestionCard } from '../components/SubquestionCard.tsx'
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

  const handleSubquestionChange = (index: number, nextValue: string) => {
    const next = [...data.subquestions]
    next[index] = nextValue
    updateField('subquestions', next)
  }

  const handleRemoveSubquestion = (index: number) => {
    if (data.subquestions.length <= 1) return
    const next = data.subquestions.filter((_, idx) => idx !== index)
    updateField('subquestions', next)
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <AIGeneratorPanel initialTopic={data.mainQuestion || project.name} onGenerate={handleAiGenerate} />
        </div>
        <div className="w-full lg:w-80">
          <PhaseChecklist items={checklistItems} />
        </div>
      </div>

      <section className="space-y-6">
        <div className="space-y-6">
          <BrutalCard className="bg-neutral-100" title="Pregunta principal" titleClassName="text-black">
            <BrutalInput
              multiline
              value={data.mainQuestion}
              onChange={(event) => updateField('mainQuestion', event.target.value)}
              badge={aiBadgeFor('mainQuestion') ? '🤖 IA' : undefined}
            />
          </BrutalCard>

          <BrutalCard className="bg-neutral-100 space-y-4" title="Subpreguntas clave" titleClassName="text-black">
            <div className="grid gap-4">
              {data.subquestions.map((subquestion, index) => (
                <SubquestionCard
                  key={`${index}-${subquestion.slice(0, 16)}`}
                  index={index}
                  value={subquestion}
                  onChange={(value) => handleSubquestionChange(index, value)}
                  onRemove={() => handleRemoveSubquestion(index)}
                  disableRemove={data.subquestions.length <= 1}
                  badge={aiBadgeFor('subquestions') ? '🤖 IA' : undefined}
                />
              ))}
            </div>
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
      </section>

      {(isSaving || aiLoading || toastVisible) && (
        <div className="fixed bottom-6 right-6 border-4 border-black bg-neutral-100 text-main font-mono px-5 py-3 shadow-brutal">
          {isSaving ? '💾 Guardando...' : toastVisible ? '💾 Guardado' : aiLoading ? '🤖 IA aplicada' : null}
        </div>
      )}
    </div>
  )
}
