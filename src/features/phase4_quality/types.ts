export type StudyType = 'RCT' | 'Quasi-experimental' | 'Observational' | 'Systematic Review'

export type CaspAnswer = 'Yes' | 'Partial' | 'No'

export interface CaspCriterion {
  id: string
  question: string
  answer: CaspAnswer
  notes?: string
}

export type QualityLevel = 'High' | 'Medium' | 'Low'

export interface QualityAssessment {
  id: string
  studyId: string
  studyType: StudyType
  criteria: CaspCriterion[]
  totalScore: number
  qualityLevel: QualityLevel
  assessedAt: number
}
