import { createPhase1Defaults, type Phase1Data } from '../phase1_planning/types.ts'
import type { ExternalPaper, ExternalSource, Phase2Strategy } from '../phase2_search/types.ts'
import type { QualityLevel } from '../phase4_quality/types.ts'

export type PhaseKey = 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'phase6' | 'phase7'

export interface SubquestionLog {
  subquestion: string
  lastSearchAt: number
  savedAt: number
  selectedSources: ExternalSource[]
  yearFilters: { from: number; to: number }
  keywords: string[]
  databaseStrategies: { database: string; query: string }[]
  totalResults: number
  savedCount: number
}

export interface Phase2Data {
  lastStrategy: Phase2Strategy | null
  hiddenSubquestions: string[]
  selectedSources?: ExternalSource[]
  yearFilters?: { from: number; to: number }
  searchedSubquestions?: string[]
  lockedSubquestions?: string[]
  cooldownUntil?: number | null
  hideNoYear?: boolean
  enforceYearRange?: boolean
  lastSearchAt?: number | null
  lastSearchSubquestion?: string | null
  lastSearchResultCount?: number | null
  documentationGeneratedAt?: number | null
  documentationSummary?: string | null
  subquestionLogs?: Record<string, SubquestionLog>
}

export interface Project {
  id: string
  userId: string
  name: string
  createdAt: number
  updatedAt: number
  templateUsed?: string
  totalTasks: number
  completedTasks: number
  currentPhase?: PhaseKey
  phase1: Phase1Data
  phase2?: Phase2Data
  // Future phases will extend this interface
}

export type ScreeningStatus = 'pending' | 'screened'
export type ScreeningDecision = 'include' | 'exclude' | 'uncertain'
export type ScreeningConfidence = 'high' | 'medium' | 'low'

export interface Candidate extends ExternalPaper {
  projectId: string
  screeningStatus: ScreeningStatus
  decision?: ScreeningDecision
  confidence?: ScreeningConfidence
  reason?: string
  aiJustification?: string
  aiSubtopic?: string
  userConfirmed?: boolean
  processedAt?: number
  savedAt: number
  qualityStatus?: 'pending' | 'completed'
  qualityLevel?: QualityLevel
  qualityScore?: number
  extractionStatus?: 'pending' | 'extracted' | 'verified'
  extractionId?: string
  dedupKey: string
}

export interface PrismaData {
  identified: number
  duplicates: number
  screened: number
  included: number
  additionalRecords: number
}

export const createProjectDefaults = (overrides?: Partial<Project>): Project => ({
  id: overrides?.id ?? crypto.randomUUID(),
  userId: overrides?.userId ?? '',
  name: overrides?.name ?? 'Nuevo Proyecto',
  createdAt: overrides?.createdAt ?? Date.now(),
  updatedAt: overrides?.updatedAt ?? Date.now(),
  templateUsed: overrides?.templateUsed,
  totalTasks: overrides?.totalTasks ?? 27,
  completedTasks: overrides?.completedTasks ?? 0,
  currentPhase: overrides?.currentPhase ?? 'phase1',
  phase1: overrides?.phase1 ?? createPhase1Defaults(),
  phase2: overrides?.phase2 ?? { lastStrategy: null, hiddenSubquestions: [] },
})

export const createCandidateFromExternal = (projectId: string, paper: ExternalPaper, dedupKey: string): Candidate => ({
  ...paper,
  projectId,
  screeningStatus: 'pending',
  decision: undefined,
  confidence: undefined,
  reason: undefined,
  userConfirmed: false,
  processedAt: undefined,
  savedAt: Date.now(),
  dedupKey,
})

export const createPrismaData = (overrides?: Partial<PrismaData>): PrismaData => ({
  identified: overrides?.identified ?? 0,
  duplicates: overrides?.duplicates ?? 0,
  screened: overrides?.screened ?? 0,
  included: overrides?.included ?? 0,
  additionalRecords: overrides?.additionalRecords ?? 0,
})
