import { createPhase1Defaults, type Phase1Data } from '../phase1_planning/types.ts'

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
