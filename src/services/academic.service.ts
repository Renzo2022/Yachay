import type { ExternalPaper, ExternalSource, SearchStrategy } from '../features/phase2_search/types.ts'

const mockPapers: ExternalPaper[] = [
  {
    id: 'sem-001',
    source: 'semantic_scholar',
    title: 'Gamification frameworks for evidence-based medical training',
    authors: ['M. Quiroga', 'L. Andrade'],
    year: 2024,
    abstract:
      'Esta revisión explora cómo la gamificación y los modelos IA pueden acelerar la formación clínica basada en evidencia, destacando métricas de compromiso y retención.',
    doi: '10.5555/sem001',
    url: 'https://www.semanticscholar.org/paper/sem-001',
    isOpenAccess: true,
    citationCount: 42,
  },
  {
    id: 'sem-002',
    source: 'semantic_scholar',
    title: 'LLM-assisted search strategies for systematic reviews in STEM',
    authors: ['A. Peralta', 'D. Muñoz'],
    year: 2023,
    abstract:
      'Propone prompts optimizados para combinar consultas booleanas y modelos generativos al construir protocolos PICO en áreas STEM.',
    url: 'https://www.semanticscholar.org/paper/sem-002',
    isOpenAccess: false,
    citationCount: 18,
  },
  {
    id: 'pub-101',
    source: 'pubmed',
    title: 'Gamification for mental health interventions in higher education',
    authors: ['K. Villavicencio'],
    year: 2022,
    abstract:
      'Meta-análisis sobre el impacto de módulos gamificados para reducir ansiedad académica, integrando biometría y feedback personalizado.',
    doi: '10.7777/pub101',
    url: 'https://pubmed.ncbi.nlm.nih.gov/pub-101',
    isOpenAccess: true,
    citationCount: 65,
  },
  {
    id: 'pub-102',
    source: 'pubmed',
    title: 'Open educational resources with gamified analytics dashboards',
    authors: ['I. Espinoza', 'F. Rivas'],
    year: 2021,
    abstract:
      'Estudia cómo dashboards gamificados, alimentados por IA, ayudan a monitorear progreso y prevenir deserción en carreras STEM.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/pub-102',
    isOpenAccess: false,
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const searchFederated = async (query: string, databases: ExternalSource[]): Promise<ExternalPaper[]> => {
  await delay(2000)

  const lowered = query.toLowerCase()

  return mockPapers
    .filter((paper) => databases.includes(paper.source))
    .map((paper) => ({
      ...paper,
      title: `${paper.title} · ${lowered.includes('gamification') ? 'Gamification' : query}`,
    }))
}

export const generateSearchStrategies = async (topic: string): Promise<SearchStrategy[]> => {
  await delay(800)
  return [
    {
      database: 'Scopus',
      query: `TITLE-ABS-KEY ( "gamification" AND "${topic}" ) AND ( "systematic review" OR "evidence-based" )`,
      notes: 'Limitar a publicaciones 2019-2025, áreas Medicine OR Computer Science.',
    },
    {
      database: 'Web of Science',
      query: `TS=("gamified learning" NEAR/3 analytics) AND TS=("LLM" OR "large language model") AND TS=(${topic})`,
      notes: 'Filtrar colecciones SCI-EXPANDED y ESCI.',
    },
  ]
}
