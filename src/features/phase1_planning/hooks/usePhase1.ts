import { useEffect, useMemo, useRef, useState } from 'react'
import { createPhase1Defaults, type Phase1Data } from '../types.ts'
import { useProject } from '../../projects/ProjectContext.tsx'
import { updateProjectPhase1 } from '../../projects/project.service.ts'

type AiField = string

const getArrayFromText = (text: string) =>
  text
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)

const getTextFromArray = (values: string[]) => values.join('\n')

const buildPhase1State = (phase?: Partial<Phase1Data>): Phase1Data => {
  const defaults = createPhase1Defaults()
  return {
    ...defaults,
    ...phase,
    pico: {
      ...defaults.pico,
      ...phase?.pico,
    },
    subquestions: phase?.subquestions ?? defaults.subquestions,
    inclusionCriteria: phase?.inclusionCriteria ?? defaults.inclusionCriteria,
    exclusionCriteria: phase?.exclusionCriteria ?? defaults.exclusionCriteria,
    coherenceAnalysis: phase?.coherenceAnalysis ?? defaults.coherenceAnalysis,
    methodologicalJustification: phase?.methodologicalJustification ?? defaults.methodologicalJustification,
    objectives: phase?.objectives ?? defaults.objectives,
    mainQuestion: phase?.mainQuestion ?? defaults.mainQuestion,
  }
}

export const usePhase1 = () => {
  const project = useProject()
  const [data, setData] = useState<Phase1Data>(() => buildPhase1State(project.phase1))
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [aiFields, setAiFields] = useState<Set<AiField>>(new Set())
  const isInitialLoad = useRef(true)

  useEffect(() => {
    setData(buildPhase1State(project.phase1))
    isInitialLoad.current = true
  }, [project.id])

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    setIsSaving(true)
    const handle = setTimeout(async () => {
      await updateProjectPhase1(project.id, data)
      setIsSaving(false)
      setLastSavedAt(Date.now())
    }, 2000)

    return () => clearTimeout(handle)
  }, [data, project.id])

  const updateField = <K extends keyof Phase1Data>(key: K, value: Phase1Data[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const updatePicoField = (key: keyof Phase1Data['pico'], value: string) => {
    setData((prev) => ({
      ...prev,
      pico: {
        ...prev.pico,
        [key]: value,
      },
    }))
  }

  const updateListField = (key: 'inclusionCriteria' | 'exclusionCriteria' | 'subquestions', value: string) => {
    updateField(key, getArrayFromText(value) as Phase1Data[typeof key])
  }

  const getListTextValue = (key: 'inclusionCriteria' | 'exclusionCriteria' | 'subquestions') =>
    getTextFromArray(data[key])

  const applyAiProtocol = (payload: Phase1Data) => {
    setData(payload)
    const newAiFields = new Set<AiField>([
      'mainQuestion',
      'objectives',
      'coherenceAnalysis',
      'methodologicalJustification',
      'subquestions',
      'inclusionCriteria',
      'exclusionCriteria',
      'pico.population',
      'pico.intervention',
      'pico.comparison',
      'pico.outcome',
    ])
    setAiFields(newAiFields)
  }

  const aiBadgeFor = (field: AiField) => aiFields.has(field)

  const completionChecklist = useMemo(
    () => {
      const picoComplete = ['population', 'intervention', 'comparison', 'outcome'].every(
        (key) => Boolean(data.pico[key as keyof Phase1Data['pico']].trim()),
      )
      const subquestionsCount = data.subquestions.length
      return {
        mainQuestion: Boolean(data.mainQuestion.trim()) && picoComplete,
        subquestions: subquestionsCount >= 3 && subquestionsCount <= 5,
        coherence: Boolean(data.coherenceAnalysis.trim()),
        justification: Boolean(data.objectives.trim()) && Boolean(data.methodologicalJustification.trim()),
        criteria: data.inclusionCriteria.length > 0 && data.exclusionCriteria.length > 0,
      }
    },
    [data],
  )

  return {
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
  }
}
