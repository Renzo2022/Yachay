import type { Phase1Data } from '../features/phase1_planning/types.ts'

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
