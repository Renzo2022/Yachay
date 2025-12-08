import type { Phase1Data } from '../features/phase1_planning/types.ts'
import type { Candidate } from '../features/projects/types.ts'
import type { ExtractionPayload } from '../features/phase5_extraction/types.ts'

export type GeneratedProtocolPayload = {
  topic: string
  protocol: {
    mainQuestion: string
    pico: {
      population: string
      intervention: string
      comparison: string
      outcome: string
    }
    inclusionCriteria: string[]
    exclusionCriteria: string[]
  }
  generatedAt: number
}

const evaluateDecision = (title: string, abstract: string): Candidate['decision'] => {
  const normalized = `${title} ${abstract}`.toLowerCase()
  if (normalized.includes('gamification')) return 'include'
  if (normalized.includes('k-12') || normalized.includes('school')) return 'exclude'
  return 'uncertain'
}

export const screenPaper = async (paper: Candidate, criteria: Phase1Data): Promise<Candidate> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const decision = evaluateDecision(paper.title, paper.abstract)

  const reasonMap: Record<NonNullable<Candidate['decision']>, string> = {
    include: `Cumple criterios PICO (${criteria.pico.population}) y menciona Gamification.`,
    exclude: 'Población escolar (K-12) fuera del alcance universitario definido.',
    uncertain: 'No hay suficiente contexto para asegurar cumplimiento de criterios. Requiere revisión humana.',
  }

  const confidenceMap: Record<NonNullable<Candidate['decision']>, Candidate['confidence']> = {
    include: 'high',
    exclude: 'high',
    uncertain: 'medium',
  }

  return {
    ...paper,
    screeningStatus: 'screened',
    decision,
    confidence: decision ? confidenceMap[decision] : 'medium',
    reason: decision ? reasonMap[decision] : undefined,
    processedAt: Date.now(),
    userConfirmed: false,
  }
}

const PICO_TEMPLATE: GeneratedProtocolPayload['protocol']['pico'] = {
  population: 'Docentes de educación superior en Latinoamérica',
  intervention: 'Implementación de plataformas basadas en IA para evaluación automática',
  comparison: 'Métodos tradicionales de evaluación manual',
  outcome: 'Mejora en la objetividad, rapidez y retroalimentación para estudiantes',
}

const PROTOCOL_RESPONSE: GeneratedProtocolPayload['protocol'] = {
  mainQuestion: '¿Cómo impacta la evaluación automatizada con IA en la calidad de la retroalimentación en cursos STEM?',
  pico: PICO_TEMPLATE,
  inclusionCriteria: ['Estudios revisados por pares', 'Publicaciones a partir de 2018', 'Contexto universitario'],
  exclusionCriteria: ['Estudios sin datos cuantitativos', 'Artículos de opinión sin metodología'],
}

export const generateProtocolFromTemplate = async (topic: string): Promise<GeneratedProtocolPayload> => {
  const hasApiKey = Boolean(import.meta.env.VITE_GROQ_API_KEY)

  if (!hasApiKey) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return {
      topic,
      protocol: PROTOCOL_RESPONSE,
      generatedAt: Date.now(),
    }
  }

  // TODO: Implement real Groq call using groq-sdk when API key is available.
  return {
    topic,
    protocol: PROTOCOL_RESPONSE,
    generatedAt: Date.now(),
  }
}

export const generatePhase1Protocol = async (topic: string): Promise<Phase1Data> => {
  await new Promise((resolve) => setTimeout(resolve, 1800))
  return {
    mainQuestion: `¿Cómo impacta ${topic} en los resultados de aprendizaje y retención en contextos STEM?`,
    subquestions: [
      `¿Qué métricas definen el éxito de ${topic}?`,
      `¿Qué poblaciones obtienen mayor beneficio al aplicar ${topic}?`,
    ],
    objectives: `Evaluar rigurosamente la eficacia de ${topic} combinando métricas cuantitativas (engagement, retención) y cualitativas (percepción docente).`,
    pico: {
      population: 'Estudiantes universitarios en programas STEM',
      intervention: `${topic} potenciadas con analítica e IA`,
      comparison: 'Metodologías tradicionales sin gamificación / IA',
      outcome: 'Mejora en aprendizaje basado en evidencia y reducción de deserción',
    },
    inclusionCriteria: ['Estudios 2019-2025', 'Muestran métricas cuantitativas', 'Contextos STEM o salud'],
    exclusionCriteria: ['Artículos sin revisión por pares', 'Estudios sin datos replicables'],
  }
}

const SAMPLE_EXTRACTION: ExtractionPayload = {
  sample: {
    size: 128,
    description: 'Docentes universitarios y estudiantes de ingeniería divididos en grupos control y experimental.',
  },
  methodology: {
    design: 'Ensayo controlado con mediciones pre y post intervención.',
    duration: '16 semanas',
  },
  intervention: {
    description: 'Uso de plataforma de IA para retroalimentación automática y dashboards de progreso.',
    tools: ['Plataforma IA', 'Dashboard analítico', 'Bot de retroalimentación'],
  },
  outcomes: {
    primary: 'Mejora del 18% en precisión de evaluaciones y reducción de 22% en tiempos de retroalimentación.',
    results: 'p < 0.05 para métricas de coherencia y satisfacción estudiantil.',
  },
  limitations: ['Muestra concentrada en un solo país', 'Sin seguimiento longitudinal'],
}

export const extractDataRAG = async (_pdfText: string): Promise<ExtractionPayload> => {
  const hasApiKey = Boolean(import.meta.env.VITE_GROQ_API_KEY)
  const simulatedDelay = async () => new Promise((resolve) => setTimeout(resolve, 1200))

  if (!hasApiKey) {
    await simulatedDelay()
    return SAMPLE_EXTRACTION
  }

  // TODO: Integrar Groq real cuando haya API key.
  await simulatedDelay()
  return SAMPLE_EXTRACTION
}
