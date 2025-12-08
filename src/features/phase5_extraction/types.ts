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
})
