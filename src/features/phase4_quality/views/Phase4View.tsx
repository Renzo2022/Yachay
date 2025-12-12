import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StudyList } from '../components/StudyList.tsx'
import { QualityStats } from '../components/QualityStats.tsx'
import { EvaluationModal } from '../components/EvaluationModal.tsx'
import { useQuality } from '../hooks/useQuality.ts'
import type { Candidate } from '../../projects/types.ts'
import type { ChecklistType, StudyType } from '../types.ts'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { batchSuggestQualityAssessments } from '../../../services/ai.service.ts'

export const Phase4View = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false)
  const [batchStatus, setBatchStatus] = useState<string | null>(null)
  const [showConsolidatedTable, setShowConsolidatedTable] = useState(false)

  type SuggestedCriterion = {
    id: string
    answer: 'Yes' | 'Partial' | 'No'
    evidence?: string
    justification?: string
  }

  const {
    studies,
    loading,
    assessments,
    stats,
    calculateScore,
    determineLevel,
    saveAssessment,
    getAssessmentForStudy,
    defaultCriteria,
  } = useQuality(projectId ?? '')

  const pendingStudies = useMemo(
    () => studies.filter((study) => !getAssessmentForStudy(study.id)),
    [studies, getAssessmentForStudy],
  )

  const answerLabel: Record<string, string> = {
    Yes: 'Cumple',
    Partial: 'Parcial',
    No: 'No cumple',
  }

  const consolidatedRows = useMemo(() => {
    const studyById = new Map(studies.map((study) => [study.id, study]))
    return (assessments ?? []).flatMap((assessment) => {
      const study = studyById.get(assessment.studyId)
      const title = study?.title ?? assessment.studyId
      return (assessment.criteria ?? []).map((criterion) => ({
        studyId: assessment.studyId,
        title,
        checklistType: assessment.checklistType,
        studyType: assessment.studyType,
        qualityLevel: assessment.qualityLevel,
        origin: assessment.origin ?? 'manual',
        locked: Boolean(assessment.locked),
        totalScore: assessment.totalScore,
        maxScore: assessment.criteria?.length ?? 0,
        question: criterion.question,
        answer: answerLabel[criterion.answer] ?? criterion.answer,
        evidence: criterion.evidence ?? '',
        justification: criterion.justification ?? '',
      }))
    })
  }, [assessments, studies])

  const downloadCsv = () => {
    const csvEscape = (value: unknown) => {
      const raw = String(value ?? '')
      const escaped = raw.replaceAll('"', '""')
      return `"${escaped}"`
    }

    const header = [
      'studyId',
      'title',
      'checklistType',
      'studyType',
      'qualityLevel',
      'origin',
      'locked',
      'score',
      'maxScore',
      'criterion',
      'answer',
      'evidence',
      'justification',
    ]

    const lines = [header.map(csvEscape).join(',')]
    for (const row of consolidatedRows) {
      lines.push(
        [
          row.studyId,
          row.title,
          row.checklistType,
          row.studyType,
          row.qualityLevel,
          row.origin,
          row.locked,
          row.totalScore,
          row.maxScore,
          row.question,
          row.answer,
          row.evidence,
          row.justification,
        ]
          .map(csvEscape)
          .join(','),
      )
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `phase4-quality-table-${projectId ?? 'project'}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const normalizeChecklistType = (value: unknown): ChecklistType => {
    if (value === 'AMSTAR' || value === 'STROBE' || value === 'CASP') return value
    return 'CASP'
  }

  const normalizeStudyType = (value: unknown): StudyType => {
    const allowed: StudyType[] = [
      'RCT',
      'Quasi-experimental',
      'Observational',
      'Cohort',
      'Case-control',
      'Cross-sectional',
      'Qualitative',
      'Systematic Review',
    ]
    return allowed.includes(value as StudyType) ? (value as StudyType) : 'Observational'
  }

  const handleEvaluateAllWithAI = async () => {
    if (!projectId) return
    if (!pendingStudies.length) return
    setIsBatchEvaluating(true)
    setBatchStatus('Evaluando con IA…')
    try {
      const response = await batchSuggestQualityAssessments({
        studies: pendingStudies.map((study) => ({
          id: study.id,
          title: study.title,
          abstract: study.abstract ?? '',
        })),
      })

      const results = response.results
      for (let index = 0; index < results.length; index += 1) {
        const result = results[index]
        const checklistType = normalizeChecklistType(result.checklistType)
        const studyType = normalizeStudyType(result.studyType)

        setBatchStatus(`Guardando ${index + 1}/${results.length}…`)

        const baseCriteria = defaultCriteria(checklistType)
        const suggestedById = new Map<string, SuggestedCriterion>(
          result.criteria.map((criterion: SuggestedCriterion) => [criterion.id, criterion]),
        )
        const merged = baseCriteria.map((criterion) => {
          const suggested = suggestedById.get(criterion.id)
          return {
            ...criterion,
            answer: suggested?.answer ?? criterion.answer,
            evidence: suggested?.evidence ?? criterion.evidence,
            justification: suggested?.justification ?? criterion.justification,
          }
        })

        await saveAssessment({
          studyId: result.studyId,
          studyType,
          checklistType,
          criteria: merged,
          origin: 'ai',
          locked: true,
        })
      }
      setBatchStatus('Evaluación con IA completada.')
      setShowConsolidatedTable(true)
      if (typeof document !== 'undefined') {
        setTimeout(() => {
          document.getElementById('phase4-consolidated-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)
      }
      setTimeout(() => setBatchStatus(null), 2500)
    } catch (error) {
      console.error('handleEvaluateAllWithAI', error)
      setBatchStatus('No se pudo evaluar con IA. Revisa el proxy y COHERE_API_KEY.')
    } finally {
      setIsBatchEvaluating(false)
    }
  }

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
              <p className="text-xs font-mono uppercase tracking-[0.4em] text-purple-500">Fase 4 · Calidad</p>
              <h2 className="text-3xl font-black text-neutral-900">Evaluación de calidad</h2>
              <p className="text-sm font-mono text-neutral-600">Clasifica el tipo de estudio y aplica CASP / AMSTAR / STROBE.</p>
              <div className="mt-4">
                <BrutalButton
                  variant="primary"
                  className="bg-neutral-900 text-white border-black"
                  disabled={isBatchEvaluating || pendingStudies.length === 0}
                  onClick={handleEvaluateAllWithAI}
                >
                  {isBatchEvaluating ? 'Evaluando…' : '🤖 Evaluar con IA (todos)'}
                </BrutalButton>
              </div>
            </div>
            <div className="text-right space-y-3">
              <p className="text-xs font-mono uppercase text-neutral-600">Pendientes</p>
              <p className="text-3xl font-black text-black">
                {pendingStudies.length}
              </p>
            </div>
          </div>
          {batchStatus ? <p className="mt-4 text-sm font-mono text-neutral-700">{batchStatus}</p> : null}
        </BrutalCard>

        <StudyList
          studies={studies}
          onEvaluate={(study) => setSelected(study)}
          getAssessment={getAssessmentForStudy}
        />

        <div id="phase4-consolidated-table">
          <BrutalCard className="bg-white border-black">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.4em] text-purple-500">Fase 4 · Resultados</p>
                <h3 className="text-2xl font-black text-neutral-900">Tabla consolidada</h3>
                <p className="text-sm font-mono text-neutral-600">Devuelve tabla con los resultados (manual + IA).</p>
              </div>
              <div className="flex items-center gap-3">
                <BrutalButton
                  variant="secondary"
                  className="bg-white text-black border-black"
                  disabled={consolidatedRows.length === 0}
                  onClick={() => setShowConsolidatedTable((prev) => !prev)}
                >
                  {showConsolidatedTable ? 'Ocultar tabla' : 'Visualizar tabla'}
                </BrutalButton>
                <BrutalButton
                  variant="primary"
                  className="bg-neutral-900 text-white border-black"
                  disabled={consolidatedRows.length === 0}
                  onClick={downloadCsv}
                >
                  Exportar CSV
                </BrutalButton>
              </div>
            </div>

            {consolidatedRows.length === 0 ? (
              <div className="mt-4 border-3 border-dashed border-black bg-white p-4 font-mono text-sm uppercase tracking-[0.3em]">
                No hay evaluaciones todavía.
              </div>
            ) : showConsolidatedTable ? (
              <div className="mt-4 border-3 border-black bg-white shadow-[4px_4px_0_0_#111] overflow-x-auto">
                <table className="min-w-[1100px] w-full text-sm font-mono">
                  <thead className="bg-neutral-100 text-black uppercase tracking-[0.2em] text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Estudio</th>
                      <th className="px-3 py-2 text-left">Checklist</th>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">Nivel</th>
                      <th className="px-3 py-2 text-left">Origen</th>
                      <th className="px-3 py-2 text-left">Puntaje</th>
                      <th className="px-3 py-2 text-left">Criterio</th>
                      <th className="px-3 py-2 text-left">Cumplimiento</th>
                      <th className="px-3 py-2 text-left">Evidencia</th>
                      <th className="px-3 py-2 text-left">Justificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidatedRows.map((row, index) => (
                      <tr key={`${row.studyId}-${index}`} className="border-t border-neutral-200 align-top">
                        <td className="px-3 py-2 text-neutral-900 whitespace-pre-wrap">{row.title}</td>
                        <td className="px-3 py-2 text-neutral-900">{row.checklistType}</td>
                        <td className="px-3 py-2 text-neutral-900">{row.studyType}</td>
                        <td className="px-3 py-2 text-neutral-900">{row.qualityLevel}</td>
                        <td className="px-3 py-2 text-neutral-900">{row.origin}</td>
                        <td className="px-3 py-2 text-neutral-900">
                          {row.totalScore}/{row.maxScore || '—'}
                        </td>
                        <td className="px-3 py-2 text-neutral-900 whitespace-pre-wrap">{row.question}</td>
                        <td className="px-3 py-2 text-neutral-900">{row.answer}</td>
                        <td className="px-3 py-2 text-neutral-700 whitespace-pre-wrap">{row.evidence}</td>
                        <td className="px-3 py-2 text-neutral-700 whitespace-pre-wrap">{row.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </BrutalCard>
        </div>
      </div>

      <div className="space-y-6">
        <QualityStats stats={stats} />
      </div>

      <EvaluationModal
        open={Boolean(selected)}
        study={selected}
        existing={selected ? getAssessmentForStudy(selected.id) : undefined}
        readOnly={Boolean(
          selected && (getAssessmentForStudy(selected.id)?.locked || getAssessmentForStudy(selected.id)?.origin === 'ai'),
        )}
        onClose={() => {
          setSelected(null)
        }}
        saveAssessment={saveAssessment}
        calculateScore={calculateScore}
        determineLevel={determineLevel}
        defaultCriteria={defaultCriteria}
      />
    </div>
  )
}
