export interface Phase1Data {
  mainQuestion: string
  subquestions: string[]
  pico: {
    population: string
    intervention: string
    comparison: string
    outcome: string
  }
  objectives: string
  inclusionCriteria: string[]
  exclusionCriteria: string[]
}

export const createPhase1Defaults = (): Phase1Data => ({
  mainQuestion: '',
  subquestions: [],
  objectives: '',
  pico: {
    population: '',
    intervention: '',
    comparison: '',
    outcome: '',
  },
  inclusionCriteria: [],
  exclusionCriteria: [],
})
