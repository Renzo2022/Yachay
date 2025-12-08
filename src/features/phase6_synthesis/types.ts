import type { ExtractionData } from '../phase5_extraction/types.ts'

export interface SynthesisTheme {
  id: string
  title: string
  description: string
  relatedStudies: string[]
}

export interface SynthesisData {
  themes: SynthesisTheme[]
  narrative: string
  gaps: string[]
}

export const createDefaultSynthesis = (): SynthesisData => ({
  themes: [],
  narrative: '',
  gaps: [],
})

export type ExtractionMatrix = ExtractionData[]
