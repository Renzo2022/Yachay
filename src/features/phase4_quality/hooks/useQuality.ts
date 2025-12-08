import { useEffect, useMemo, useState } from 'react'
import type { Candidate } from '../../projects/types.ts'
import type {
  CaspCriterion,
  CaspAnswer,
  QualityAssessment,
  QualityLevel,
  StudyType,
} from '../types.ts'
import {
  listenToIncludedStudies,
  listenToQualityAssessments,
  saveQualityAssessment,
} from '../../projects/project.service.ts'

const questionBank = [
  '¿La pregunta de investigación está claramente definida?',
  '¿El diseño metodológico es apropiado para la pregunta?',
  '¿La selección de participantes minimiza sesgos?',
  '¿Las variables fueron medidas con precisión?',
  '¿Se controlaron factores de confusión clave?',
  '¿Los resultados son consistentes y aplicables?',
  '¿Se evaluaron adecuadamente los riesgos/beneficios?',
  '¿Las conclusiones están justificadas por los datos?',
]

const answerScore: Record<CaspAnswer, number> = {
  Yes: 1,
  Partial: 0.5,
  No: 0,
}

const createDefaultCriteria = (): CaspCriterion[] =>
  questionBank.map((question, index) => ({
    id: `casp-${index + 1}`,
    question,
    answer: 'No',
    notes: '',
  }))

export const useQuality = (projectId: string) => {
  const [studies, setStudies] = useState<Candidate[]>([])
  const [assessments, setAssessments] = useState<QualityAssessment[]>([])
  const [studiesLoaded, setStudiesLoaded] = useState(false)

  useEffect(() => {
    const unsubscribeStudies = listenToIncludedStudies(projectId, (items) => {
      setStudies(items)
      setStudiesLoaded(true)
    })

    const unsubscribeAssessments = listenToQualityAssessments(projectId, setAssessments)

    return () => {
      unsubscribeStudies()
      unsubscribeAssessments()
    }
  }, [projectId])

  const assessmentMap = useMemo(() => {
    return assessments.reduce<Record<string, QualityAssessment>>((acc, assessment) => {
      acc[assessment.studyId] = assessment
      return acc
    }, {})
  }, [assessments])

  const stats = useMemo(() => {
    return assessments.reduce(
      (acc, assessment) => {
        acc[assessment.qualityLevel.toLowerCase() as keyof typeof acc] += 1
        return acc
      },
      { high: 0, medium: 0, low: 0 },
    )
  }, [assessments])

  const calculateScore = (criteria: CaspCriterion[]) => {
    const total = criteria.reduce((sum, criterion) => sum + (answerScore[criterion.answer] ?? 0), 0)
    return Math.round(total * 10) / 10
  }

  const determineLevel = (score: number): QualityLevel => {
    if (score >= 6.5) return 'High'
    if (score >= 4.5) return 'Medium'
    return 'Low'
  }

  const saveAssessment = async (input: {
    studyId: string
    studyType: StudyType
    criteria: CaspCriterion[]
    assessmentId?: string
  }) => {
    const totalScore = calculateScore(input.criteria)
    const qualityLevel = determineLevel(totalScore)
    const assessment: QualityAssessment = {
      id: input.assessmentId ?? crypto.randomUUID(),
      studyId: input.studyId,
      studyType: input.studyType,
      criteria: input.criteria,
      totalScore,
      qualityLevel,
      assessedAt: Date.now(),
    }

    await saveQualityAssessment(projectId, assessment)
  }

  const getAssessmentForStudy = (studyId: string) => assessmentMap[studyId]

  return {
    studies,
    loading: !studiesLoaded,
    assessments,
    stats,
    calculateScore,
    determineLevel,
    saveAssessment,
    getAssessmentForStudy,
    defaultCriteria: createDefaultCriteria,
  }
}

export type QualityStats = {
  high: number
  medium: number
  low: number
}

export const CASP_QUESTIONS = questionBank
