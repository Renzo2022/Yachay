import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Candidate } from '../../projects/types.ts'
import type { ExtractionData } from '../types.ts'
import { createEmptyExtraction } from '../types.ts'
import { listenToIncludedStudies } from '../../projects/project.service.ts'
import { listenToExtractionMatrix, saveExtractionEntry } from '../../../services/extraction.service.ts'
import { extractTextFromPdf, truncateText } from '../../../services/pdf.service.ts'
import { extractDataRAG } from '../../../services/ai.service.ts'

export const RAG_STEPS = ['Leyendo PDF...', 'Truncando texto...', 'Consultando LLM...', 'Parseando JSON...']

export type RagState = {
  studyId: string
  stepIndex: number
  label: string
  running: boolean
}

export const useExtraction = (projectId: string) => {
  const [studies, setStudies] = useState<Candidate[]>([])
  const [extractions, setExtractions] = useState<Record<string, ExtractionData>>({})
  const [extractionList, setExtractionList] = useState<ExtractionData[]>([])
  const [ragState, setRagState] = useState<RagState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastPreview, setLastPreview] = useState<string>('')

  useEffect(() => {
    if (!projectId) return

    const unsubscribeStudies = listenToIncludedStudies(projectId, setStudies)
    const unsubscribeExtraction = listenToExtractionMatrix(projectId, (entries) => {
      setExtractionList(entries)
      setExtractions(
        entries.reduce<Record<string, ExtractionData>>((acc, entry) => {
          acc[entry.studyId] = entry
          return acc
        }, {}),
      )
    })

    return () => {
      unsubscribeStudies()
      unsubscribeExtraction()
    }
  }, [projectId])

  const getExtractionForStudy = useCallback(
    (studyId: string) => {
      return extractions[studyId]
    },
    [extractions],
  )

  const stats = useMemo(() => {
    return extractionList.reduce(
      (acc, entry) => {
        if (entry.status === 'verified') acc.verified += 1
        else if (entry.status === 'extracted') acc.extracted += 1
        else acc.empty += 1
        return acc
      },
      { empty: 0, extracted: 0, verified: 0 },
    )
  }, [extractionList])

  const autoExtract = useCallback(
    async (study: Candidate, source?: File | string | null) => {
      try {
        const pdfSource = source ?? study.url
        if (!pdfSource) {
          throw new Error('Este estudio no tiene PDF asociado. Arrastra uno para continuar.')
        }

        setError(null)
        const updateStep = (index: number, running = true) =>
          setRagState({ studyId: study.id, stepIndex: index, label: RAG_STEPS[index] ?? '', running })

        updateStep(0)
        const rawText = await extractTextFromPdf(pdfSource)
        updateStep(1)
        const truncated = truncateText(rawText)
        setLastPreview(truncated.slice(0, 1200))
        updateStep(2)
        const payload = await extractDataRAG(truncated)
        updateStep(3)

        const existing = getExtractionForStudy(study.id)
        const entry: ExtractionData = existing
          ? {
              ...existing,
              ...payload,
              status: 'extracted',
            }
          : {
              ...createEmptyExtraction(study.id),
              ...payload,
              status: 'extracted',
            }

        await saveExtractionEntry(projectId, entry)
        setRagState({ studyId: study.id, stepIndex: RAG_STEPS.length - 1, label: 'Extracción completada', running: false })
        setTimeout(() => setRagState(null), 2000)
        return entry
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : 'No se pudo completar la extracción'
        setError(message)
        setRagState(null)
        throw ex
      }
    },
    [getExtractionForStudy, projectId],
  )

  const saveExtraction = useCallback(
    async (data: ExtractionData) => {
      await saveExtractionEntry(projectId, data)
    },
    [projectId],
  )

  return {
    studies,
    extractionList,
    getExtractionForStudy,
    autoExtract,
    saveExtraction,
    ragState,
    error,
    clearError: () => setError(null),
    lastPreview,
    stats,
  }
}
