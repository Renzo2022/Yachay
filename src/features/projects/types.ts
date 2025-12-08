import { createPhase1Defaults, type Phase1Data } from '../phase1_planning/types.ts'
import type { ExternalPaper } from '../phase2_search/types.ts'

export interface Project {
  id: string
  userId: string
  name: string
  createdAt: number
  updatedAt: number
  templateUsed?: string
  totalTasks: number
  completedTasks: number
  phase1: Phase1Data
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
  userConfirmed?: boolean
  processedAt?: number
  savedAt: number
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
  phase1: overrides?.phase1 ?? createPhase1Defaults(),
})

export const createCandidateFromExternal = (projectId: string, paper: ExternalPaper): Candidate => ({
  ...paper,
  projectId,
  screeningStatus: 'pending',
  decision: undefined,
  confidence: undefined,
  reason: undefined,
  userConfirmed: false,
  processedAt: undefined,
  savedAt: Date.now(),
})

export const createPrismaData = (overrides?: Partial<PrismaData>): PrismaData => ({
  identified: overrides?.identified ?? 0,
  duplicates: overrides?.duplicates ?? 0,
  screened: overrides?.screened ?? 0,
  included: overrides?.included ?? 0,
  additionalRecords: overrides?.additionalRecords ?? 0,
})
