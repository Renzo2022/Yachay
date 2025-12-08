import { useEffect, useMemo, useState } from 'react'
import { ScreeningTabs } from '../components/ScreeningTabs.tsx'
import { ScreeningCard } from '../components/ScreeningCard.tsx'
import { PrismaDiagram } from '../components/PrismaDiagram.tsx'
import { useProject } from '../../projects/ProjectContext.tsx'
import {
  confirmCandidateDecision,
  listenToCandidates,
  listenToPrismaData,
  updateCandidateRecord,
  updatePrismaData,
} from '../../projects/project.service.ts'
import { createPrismaData, type Candidate, type PrismaData } from '../../projects/types.ts'
import { screenPaper } from '../../../services/ai.service.ts'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import { BrutalInput } from '../../../core/ui-kit/BrutalInput.tsx'

export const Phase3View = () => {
  const project = useProject()
  const [activeTab, setActiveTab] = useState<'ai' | 'prisma'>('ai')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [prismaData, setPrismaData] = useState<PrismaData>(createPrismaData())
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [isBatching, setIsBatching] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [editingPrisma, setEditingPrisma] = useState({ duplicates: '0', additional: '0' })

  useEffect(() => {
    const unsubscribeCandidates = listenToCandidates(project.id, setCandidates)
    const unsubscribePrisma = listenToPrismaData(project.id, (data) => {
      setPrismaData(data)
      setEditingPrisma({
        duplicates: String(data.duplicates),
        additional: String(data.additionalRecords),
      })
    })
    return () => {
      unsubscribeCandidates()
      unsubscribePrisma()
    }
  }, [project.id])

  const pendingCandidates = useMemo(
    () => candidates.filter((candidate) => !candidate.userConfirmed),
    [candidates],
  )

  const allConfirmed = candidates.length > 0 && candidates.every((candidate) => candidate.userConfirmed)

  const handleBatchScreening = async () => {
    if (pendingCandidates.length === 0) return
    setIsBatching(true)
    for (const candidate of pendingCandidates) {
      setProcessingIds((prev) => new Set(prev).add(candidate.id))
      const screened = await screenPaper(candidate, project.phase1)
      await updateCandidateRecord(project.id, candidate.id, {
        decision: screened.decision,
        reason: screened.reason,
        confidence: screened.confidence,
        screeningStatus: screened.screeningStatus,
        processedAt: screened.processedAt,
      })
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(candidate.id)
        return next
      })
    }
    setIsBatching(false)
  }

  const handleConfirm = async (candidate: Candidate, decision: Candidate['decision']) => {
    await confirmCandidateDecision(project.id, candidate, decision)
    setStatusMessage(decision === 'include' ? 'Paper incluido' : 'Paper excluido')
    setTimeout(() => setStatusMessage(null), 2500)
  }

  const handlePrismaChange = (key: 'duplicates' | 'additional', value: string) => {
    if (!/^\d*$/.test(value)) return
    setEditingPrisma((prev) => ({ ...prev, [key]: value }))
  }

  const persistPrisma = async () => {
    await updatePrismaData(project.id, {
      duplicates: Number(editingPrisma.duplicates || 0),
      additionalRecords: Number(editingPrisma.additional || 0),
    })
    setStatusMessage('PRISMA actualizado')
    setTimeout(() => setStatusMessage(null), 2000)
  }

  return (
    <div className="space-y-6">
      <ScreeningTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'ai' ? (
        <div className="space-y-6">
          <BrutalCard className="bg-neutral-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent-warning">
                  {pendingCandidates.length} Candidatos pendientes
                </p>
                <p className="text-sm font-mono text-main">Total guardados: {candidates.length}</p>
              </div>
              <BrutalButton
                variant="secondary"
                className="bg-accent-warning text-main border-black"
                onClick={handleBatchScreening}
                disabled={pendingCandidates.length === 0 || isBatching}
              >
                🤖 Iniciar cribado IA
              </BrutalButton>
            </div>
          </BrutalCard>

          {candidates.length === 0 ? (
            <div className="border-4 border-dashed border-accent-warning bg-neutral-900 text-text-main text-center py-20 px-8 shadow-brutal">
              No hay candidatos cargados. Completa la fase de búsqueda para continuar.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {candidates.map((candidate) => (
                <ScreeningCard
                  key={candidate.id}
                  candidate={candidate}
                  processing={processingIds.has(candidate.id)}
                  onConfirm={(decision) => handleConfirm(candidate, decision)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalInput
              label="Duplicados eliminados"
              value={editingPrisma.duplicates}
              onChange={(event) => handlePrismaChange('duplicates', event.target.value)}
            />
            <BrutalInput
              label="Registros adicionales"
              value={editingPrisma.additional}
              onChange={(event) => handlePrismaChange('additional', event.target.value)}
            />
          </div>
          <BrutalButton variant="secondary" className="bg-accent-warning text-main border-black" onClick={persistPrisma}>
            Guardar datos PRISMA
          </BrutalButton>
          <PrismaDiagram data={prismaData} />
        </div>
      )}

      {(isBatching || processingIds.size > 0) && (
        <div className="fixed inset-0 bg-black/70 text-text-main flex flex-col gap-4 items-center justify-center font-mono text-xl z-40">
          <div className="w-10 h-10 border-4 border-black bg-accent-warning animate-square-blink" />
          <p>Procesando cribado asistido...</p>
        </div>
      )}

      {statusMessage ? (
        <div className="fixed bottom-6 right-6 border-4 border-black bg-neutral-100 px-4 py-3 font-mono text-main shadow-brutal">
          {statusMessage}
        </div>
      ) : null}

      {allConfirmed ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <BrutalButton variant="primary" className="bg-accent-warning text-main border-black">
            ➡ Finalizar Fase 3
          </BrutalButton>
        </div>
      ) : null}
    </div>
  )
}
