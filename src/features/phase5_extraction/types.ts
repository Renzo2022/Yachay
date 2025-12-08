export interface ExtractionData {
  id: string
  studyId: string
  sample: {
    size: number
    description: string
  }
  methodology: {
    design: string
    duration: string
  }
  intervention: {
    description: string
    tools: string[]
  }
  outcomes: {
    primary: string
    results: string
  }
  limitations: string[]
  status: 'empty' | 'extracted' | 'verified'
  context?: {
    year?: number
    country?: string
  }
  effect?: {
    value: number
    lower: number
    upper: number
  }
}

export type ExtractionPayload = Omit<ExtractionData, 'id' | 'studyId' | 'status'>

export const createEmptyExtraction = (studyId: string): ExtractionData => ({
  id: crypto.randomUUID(),
  studyId,
  sample: {
    size: 0,
    description: '',
  },
  methodology: {
    design: '',
    duration: '',
  },
  intervention: {
    description: '',
    tools: [],
  },
  outcomes: {
    primary: '',
    results: '',
  },
  limitations: [],
  status: 'empty',
  context: {},
  effect: {
    value: 0,
    lower: -0.5,
    upper: 0.5,
  },
})
