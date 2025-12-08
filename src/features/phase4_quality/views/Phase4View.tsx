import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { StudyList } from '../components/StudyList.tsx'
import { QualityStats } from '../components/QualityStats.tsx'
import { EvaluationModal } from '../components/EvaluationModal.tsx'
import { useQuality } from '../hooks/useQuality.ts'
import type { Candidate } from '../../projects/types.ts'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'

export const Phase4View = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [selected, setSelected] = useState<Candidate | null>(null)

  const {
    studies,
    loading,
    stats,
    calculateScore,
    determineLevel,
    saveAssessment,
    getAssessmentForStudy,
    defaultCriteria,
  } = useQuality(projectId ?? '')

  if (!projectId) {
    return <div className="border-4 border-black bg-white p-6 font-mono text-xl">Proyecto no encontrado.</div>
  }

  if (loading) {
    return (
      <div className="border-4 border-black bg-neutral-900 text-text-main p-8 font-mono text-xl">
        Cargando evaluaciones...
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[70%_1fr] gap-8">
      <div className="space-y-6">
        <BrutalCard className="bg-white border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.4em] text-purple-500">Fase 4 · Evaluación</p>
              <h2 className="text-3xl font-black text-neutral-900">Evaluación CASP</h2>
              <p className="text-sm font-mono text-neutral-600">Aplica los 8 criterios de calidad y clasifica automáticamente.</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono uppercase text-neutral-600">Pendientes</p>
              <p className="text-3xl font-black">
                {studies.filter((study) => !getAssessmentForStudy(study.id)).length}
              </p>
            </div>
          </div>
        </BrutalCard>

        <StudyList studies={studies} onEvaluate={setSelected} getAssessment={getAssessmentForStudy} />
      </div>

      <div className="space-y-6">
        <QualityStats stats={stats} />
      </div>

      <EvaluationModal
        open={Boolean(selected)}
        study={selected}
        existing={selected ? getAssessmentForStudy(selected.id) : undefined}
        onClose={() => setSelected(null)}
        saveAssessment={saveAssessment}
        calculateScore={calculateScore}
        determineLevel={determineLevel}
        defaultCriteria={defaultCriteria}
      />
    </div>
  )
}
