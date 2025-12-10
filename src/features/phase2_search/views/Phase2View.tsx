import { useCallback, useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { SearchHeader } from '../components/SearchHeader.tsx'
import { PaperCard } from '../components/PaperCard.tsx'
import { StrategySummary } from '../components/StrategyGeneratorModal.tsx'
import { Phase2Checklist } from '../components/Phase2Checklist'
import type { ExternalPaper, ExternalSource, Phase2Strategy } from '../types.ts'
import type { Phase2Data, SubquestionLog } from '../../projects/types.ts'
import { generatePhase2Strategy, searchDatabase } from '../../../services/academic.service.ts'
import { useProject } from '../../projects/ProjectContext.tsx'
import { savePhase2State, saveProjectCandidates } from '../../projects/project.service.ts'
import { createPhase1Defaults } from '../../phase1_planning/types.ts'

const ALL_SOURCES: ExternalSource[] = ['semantic_scholar', 'pubmed', 'crossref', 'europe_pmc']
const SOURCE_LABELS: Record<ExternalSource, string> = {
  semantic_scholar: 'Semantic Scholar',
  pubmed: 'PubMed',
  crossref: 'CrossRef',
  europe_pmc: 'Europe PMC',
}
const INITIAL_YEAR_FILTERS = { from: 2010, to: new Date().getFullYear() }
const normalizeSubquestionKey = (value?: string | null): string => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : 'Subpregunta sin título'
}

const formatSourceList = (sources: ExternalSource[]): string => {
  if (!sources?.length) return 'Sin fuentes registradas'
  return sources.map((source) => SOURCE_LABELS[source]).join(', ')
}

const sanitizeStrategy = (input: Phase2Strategy | null | undefined): Phase2Strategy | null => {
  if (!input) return null
  return {
    question: input.question ?? '',
    keywordMatrix: Array.isArray(input.keywordMatrix)
      ? input.keywordMatrix.map((entry) => ({
          component: entry?.component ?? 'P',
          concept: entry?.concept ?? '',
          terms: Array.isArray(entry?.terms)
            ? entry.terms.map((term) => term?.toString().trim()).filter((term): term is string => Boolean(term))
            : [],
        }))
      : [],
    subquestionStrategies: Array.isArray(input.subquestionStrategies)
      ? input.subquestionStrategies.map((block) => ({
          subquestion: block?.subquestion ?? '',
          keywords: Array.isArray(block?.keywords)
            ? block.keywords.map((kw) => kw?.toString().trim()).filter((kw): kw is string => Boolean(kw))
            : [],
          databaseStrategies: Array.isArray(block?.databaseStrategies)
            ? block.databaseStrategies.map((strategy) => ({
                database: strategy?.database ?? 'Database',
                query: strategy?.query ?? '',
                filters: strategy?.filters ?? '',
                estimatedResults: strategy?.estimatedResults ?? '',
              }))
            : [],
        }))
      : [],
    recommendations: Array.isArray(input.recommendations)
      ? input.recommendations.map((rec) => rec?.toString().trim()).filter((rec): rec is string => Boolean(rec))
      : [],
  }
}

type Phase2MetaState = {
  lastSearchAt: number | null
  lastSearchSubquestion: string | null
  lastSearchResultCount: number | null
  documentationGeneratedAt: number | null
}

export const Phase2View = () => {
  const project = useProject()
  const [rawPapers, setRawPapers] = useState<ExternalPaper[]>([])
  const [papers, setPapers] = useState<ExternalPaper[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [strategy, setStrategy] = useState<Phase2Strategy | null>(sanitizeStrategy(project.phase2?.lastStrategy))
  const [derivationLoading, setDerivationLoading] = useState(false)
  const [subquestionLoading, setSubquestionLoading] = useState(false)
  const [strategyError, setStrategyError] = useState<string | null>(null)
  const [hiddenSubquestions, setHiddenSubquestions] = useState<Set<string>>(
    new Set(project.phase2?.hiddenSubquestions ?? []),
  )
  const [selectedSources, setSelectedSources] = useState<ExternalSource[]>(project.phase2?.selectedSources ?? ALL_SOURCES)
  const [yearFilters, setYearFilters] = useState(project.phase2?.yearFilters ?? INITIAL_YEAR_FILTERS)
  const [searchedSubquestions, setSearchedSubquestions] = useState<Set<string>>(
    new Set(project.phase2?.searchedSubquestions ?? []),
  )
  const [lockedSubquestions, setLockedSubquestions] = useState<Set<string>>(
    new Set(project.phase2?.lockedSubquestions ?? []),
  )
  const [searchingSubquestion, setSearchingSubquestion] = useState<string | null>(null)
  const [activeSubquestion, setActiveSubquestion] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [phase2Meta, setPhase2Meta] = useState<Phase2MetaState>({
    lastSearchAt: project.phase2?.lastSearchAt ?? null,
    lastSearchSubquestion: project.phase2?.lastSearchSubquestion ?? null,
    lastSearchResultCount: project.phase2?.lastSearchResultCount ?? null,
    documentationGeneratedAt: project.phase2?.documentationGeneratedAt ?? null,
  })
  const [documentationSummary, setDocumentationSummary] = useState<string | null>(
    project.phase2?.documentationSummary ?? null,
  )
  const [subquestionLogs, setSubquestionLogs] = useState<Record<string, SubquestionLog>>(project.phase2?.subquestionLogs ?? {})
  const [hideNoYear, setHideNoYear] = useState(project.phase2?.hideNoYear ?? false)
  const [enforceYearRange, setEnforceYearRange] = useState(project.phase2?.enforceYearRange ?? true)
  const [derivationReady, setDerivationReady] = useState<boolean>(
    Boolean(project.phase2?.lastStrategy?.keywordMatrix?.length),
  )
  const [subquestionReady, setSubquestionReady] = useState<boolean>(
    Boolean(project.phase2?.lastStrategy?.subquestionStrategies?.length),
  )
  const filterPapers = useCallback(
    (source: ExternalPaper[]) => {
      let filtered = source
      if (hideNoYear) {
        filtered = filtered.filter((paper) => typeof paper.year === 'number')
      }
      if (enforceYearRange) {
        filtered = filtered.filter((paper) => {
          if (typeof paper.year !== 'number') return true
          return paper.year >= yearFilters.from && paper.year <= yearFilters.to
        })
      }
      return filtered
    },
    [hideNoYear, enforceYearRange, yearFilters],
  )

  useEffect(() => {
    setPapers(filterPapers(rawPapers))
  }, [rawPapers, filterPapers])

  useEffect(() => {
    setStrategy(sanitizeStrategy(project.phase2?.lastStrategy))
    setHiddenSubquestions(new Set(project.phase2?.hiddenSubquestions ?? []))
    setSelectedSources(project.phase2?.selectedSources ?? ALL_SOURCES)
    setYearFilters(project.phase2?.yearFilters ?? INITIAL_YEAR_FILTERS)
    setSearchedSubquestions(new Set(project.phase2?.searchedSubquestions ?? []))
    setLockedSubquestions(new Set(project.phase2?.lockedSubquestions ?? []))
    setHideNoYear(project.phase2?.hideNoYear ?? false)
    setEnforceYearRange(project.phase2?.enforceYearRange ?? true)
    setPhase2Meta({
      lastSearchAt: project.phase2?.lastSearchAt ?? null,
      lastSearchSubquestion: project.phase2?.lastSearchSubquestion ?? null,
      lastSearchResultCount: project.phase2?.lastSearchResultCount ?? null,
      documentationGeneratedAt: project.phase2?.documentationGeneratedAt ?? null,
    })
    setDerivationReady(Boolean(project.phase2?.lastStrategy?.keywordMatrix?.length))
    setSubquestionReady(Boolean(project.phase2?.lastStrategy?.subquestionStrategies?.length))
    setSubquestionLogs(project.phase2?.subquestionLogs ?? {})
    setDocumentationSummary(project.phase2?.documentationSummary ?? null)
  }, [project.phase2])

  const persistPhase2State = useCallback(
    async (override: Partial<Phase2Data> = {}) => {
      try {
        const payload: Phase2Data = {
          lastStrategy:
            override.lastStrategy !== undefined ? sanitizeStrategy(override.lastStrategy) : (strategy ?? null),
          hiddenSubquestions:
            override.hiddenSubquestions !== undefined
              ? [...override.hiddenSubquestions]
              : Array.from(hiddenSubquestions),
          selectedSources: override.selectedSources !== undefined ? override.selectedSources : selectedSources,
          yearFilters: override.yearFilters ?? yearFilters,
          lockedSubquestions:
            override.lockedSubquestions !== undefined
              ? [...override.lockedSubquestions]
              : Array.from(lockedSubquestions),
          hideNoYear: override.hideNoYear ?? hideNoYear,
          enforceYearRange: override.enforceYearRange ?? enforceYearRange,
          searchedSubquestions:
            override.searchedSubquestions !== undefined
              ? [...override.searchedSubquestions]
              : Array.from(searchedSubquestions),
          lastSearchAt:
            override.lastSearchAt !== undefined ? override.lastSearchAt : phase2Meta.lastSearchAt ?? null,
          lastSearchSubquestion:
            override.lastSearchSubquestion !== undefined
              ? override.lastSearchSubquestion
              : phase2Meta.lastSearchSubquestion ?? null,
          lastSearchResultCount:
            override.lastSearchResultCount !== undefined
              ? override.lastSearchResultCount
              : phase2Meta.lastSearchResultCount ?? null,
          documentationGeneratedAt:
            override.documentationGeneratedAt !== undefined
              ? override.documentationGeneratedAt
              : phase2Meta.documentationGeneratedAt ?? null,
          documentationSummary:
            override.documentationSummary !== undefined
              ? override.documentationSummary
              : documentationSummary ?? null,
          subquestionLogs: override.subquestionLogs ?? subquestionLogs,
        }
        await savePhase2State(project.id, payload)
      } catch (error) {
        console.error('persistPhase2State', error)
      }
    },
    [
      project.id,
      strategy,
      hiddenSubquestions,
      selectedSources,
      yearFilters,
      lockedSubquestions,
      hideNoYear,
      enforceYearRange,
      searchedSubquestions,
      phase2Meta,
      documentationSummary,
      subquestionLogs,
    ],
  )

  const handleToggleSource = (source: ExternalSource) => {
    setSelectedSources((prev) => {
      const next = prev.includes(source) ? prev.filter((entry) => entry !== source) : [...prev, source]
      persistPhase2State({ selectedSources: next })
      return next
    })
  }

  const handleGenerateDerivation = async () => {
    if (selectedSources.length === 0) {
      showStatus('Selecciona al menos una base de datos para generar estrategias.')
      return
    }
    setPapers([])
    setSearchPerformed(false)
    setActiveSubquestion(null)
    setSelectedIds(new Set())
    setSearchedSubquestions(new Set())
    setYearFilters(INITIAL_YEAR_FILTERS)
    setDerivationLoading(true)
    setStrategyError(null)
    try {
      const payload = await generatePhase2Strategy(project.phase1 ?? createPhase1Defaults(), project.name, selectedSources, {
        step: 'derivation',
      })
      const nextHidden = new Set<string>()
      setStrategy(payload)
      setHiddenSubquestions(nextHidden)
      const nextSearched = new Set<string>()
      setSearchedSubquestions(nextSearched)
      setPhase2Meta((prev) => ({ ...prev, documentationGeneratedAt: null }))
      setDocumentationSummary(null)
      persistPhase2State({
        lastStrategy: payload,
        hiddenSubquestions: Array.from(nextHidden),
        searchedSubquestions: Array.from(nextSearched),
        documentationGeneratedAt: null,
        documentationSummary: null,
      })
      setDerivationReady(true)
      setSubquestionReady(false)
    } catch (error) {
      console.error('handleGenerateStrategies', error)
      setStrategy(null)
      setHiddenSubquestions(new Set())
      setStrategyError('No pudimos generar la estrategia. Intenta nuevamente.')
      setPhase2Meta((prev) => ({ ...prev, documentationGeneratedAt: null }))
      setDocumentationSummary(null)
      persistPhase2State({ lastStrategy: null, hiddenSubquestions: [], documentationGeneratedAt: null, documentationSummary: null })
      setDerivationReady(false)
      setSubquestionReady(false)
    } finally {
      setDerivationLoading(false)
    }
  }

  const handleGenerateSubquestionKeywords = async () => {
    if (!derivationReady || !strategy?.keywordMatrix?.length) {
      showStatus('Primero genera la derivación de términos para habilitar las keywords por subpregunta.')
      return
    }
    if (selectedSources.length === 0) {
      showStatus('Selecciona al menos una base antes de generar keywords.')
      return
    }
    setSubquestionLoading(true)
    setStrategyError(null)
    try {
      const payload = await generatePhase2Strategy(project.phase1 ?? createPhase1Defaults(), project.name, selectedSources, {
        step: 'subquestions',
        keywordMatrix: strategy.keywordMatrix,
      })
      const nextStrategy: Phase2Strategy = strategy
        ? {
            ...strategy,
            question: payload.question || strategy.question,
            subquestionStrategies: payload.subquestionStrategies,
            recommendations: payload.recommendations,
          }
        : payload
      const nextHidden = new Set<string>()
      setStrategy(nextStrategy)
      setHiddenSubquestions(nextHidden)
      const nextSearched = new Set<string>()
      setSearchedSubquestions(nextSearched)
      setPhase2Meta((prev) => ({ ...prev, documentationGeneratedAt: null }))
      setDocumentationSummary(null)
      persistPhase2State({
        lastStrategy: nextStrategy,
        hiddenSubquestions: Array.from(nextHidden),
        searchedSubquestions: Array.from(nextSearched),
        documentationGeneratedAt: null,
        documentationSummary: null,
      })
      showStatus('Keywords por subpregunta regeneradas.')
      setSubquestionReady(true)
    } catch (error) {
      console.error('handleGenerateSubquestionKeywords', error)
      setStrategyError('No pudimos regenerar las keywords por subpregunta. Intenta nuevamente.')
    } finally {
      setSubquestionLoading(false)
    }
  }

  const toggleSelection = (paperId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(paperId)) {
        next.delete(paperId)
      } else {
        next.add(paperId)
      }
      return next
    })
  }

  const selectedPapers = useMemo(() => papers.filter((paper) => selectedIds.has(paper.id)), [papers, selectedIds])
  const allVisibleSelected = useMemo(() => papers.length > 0 && papers.every((paper) => selectedIds.has(paper.id)), [papers, selectedIds])

  const visibleSubquestions = useMemo(() => {
    if (!strategy) return []
    return strategy.subquestionStrategies.filter((block) => !hiddenSubquestions.has(block.subquestion))
  }, [strategy, hiddenSubquestions])

  const currentSubLocked = useMemo(() => {
    if (!activeSubquestion) return false
    return lockedSubquestions.has(normalizeSubquestionKey(activeSubquestion))
  }, [activeSubquestion, lockedSubquestions])

  const hasCompletedAllSubquestions = useMemo(() => {
    if (!subquestionReady) return false
    if (visibleSubquestions.length === 0) return false
    return visibleSubquestions.every((block) => lockedSubquestions.has(normalizeSubquestionKey(block.subquestion)))
  }, [visibleSubquestions, lockedSubquestions, subquestionReady])

  const showStatus = (message: string) => {
    setStatusMessage(message)
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const handleRemoveSubquestion = (subquestion: string) => {
    if (!strategy) return
    if (visibleSubquestions.length <= 1) {
      showStatus('Debes conservar al menos una subpregunta.')
      return
    }
    const nextHidden = new Set(hiddenSubquestions)
    nextHidden.add(subquestion)
    setHiddenSubquestions(nextHidden)
    persistPhase2State({ hiddenSubquestions: Array.from(nextHidden) })
    if (activeSubquestion === subquestion) {
      setActiveSubquestion(null)
    }
  }

  const handleSearchSubquestion = async (
    block: Phase2Strategy['subquestionStrategies'][number] | undefined,
  ) => {
    if (!block) return
    if (selectedSources.length === 0) {
      showStatus('Selecciona al menos una base antes de buscar.')
      return
    }
    const targetSubquestion = block.subquestion || 'Subpregunta sin título'
    const normalizedKey = normalizeSubquestionKey(targetSubquestion)
    if (lockedSubquestions.has(normalizedKey)) {
      showStatus('Esta subpregunta ya se completó.')
      return
    }
    setSearchingSubquestion(targetSubquestion)
    setActiveSubquestion(targetSubquestion)
    setLoading(true)
    setSelectedIds(new Set())

    try {
      const tasks = selectedSources.map(async (source) => {
        const label = SOURCE_LABELS[source].toLowerCase()
        const strategyMatch = (block.databaseStrategies ?? []).find((entry) =>
          (entry?.database ?? '').toLowerCase().includes(label),
        )
        const fallbackQuery =
          strategyMatch?.query || block.keywords?.join(' OR ') || block.subquestion || targetSubquestion
        const results = await searchDatabase(source, fallbackQuery)
        return { source, query: fallbackQuery, results }
      })

      const payloads = await Promise.all(tasks)
      const results = payloads.flatMap((entry) => entry.results)
      const visibleResults = filterPapers(results)

      setRawPapers(results)
      setPapers(visibleResults)
      setSearchPerformed(true)
      const timestamp = Date.now()
      const nextMeta = {
        lastSearchAt: timestamp,
        lastSearchSubquestion: targetSubquestion,
        lastSearchResultCount: visibleResults.length,
      }
      const strategyBlock = block
      const databaseEntries = (strategyBlock.databaseStrategies ?? []).map((entry) => ({
        database: entry?.database ?? 'Base sin nombre',
        query: entry?.query ?? '',
      }))
      const nextLogEntry: SubquestionLog = {
        subquestion: targetSubquestion,
        lastSearchAt: timestamp,
        savedAt: subquestionLogs[normalizedKey]?.savedAt ?? 0,
        selectedSources,
        yearFilters,
        keywords: strategyBlock.keywords ?? [],
        databaseStrategies: databaseEntries,
        totalResults: visibleResults.length,
        savedCount: subquestionLogs[normalizedKey]?.savedCount ?? 0,
      }
      const nextLogs = { ...subquestionLogs, [normalizedKey]: nextLogEntry }
      setSubquestionLogs(nextLogs)
      setPhase2Meta((prev) => ({ ...prev, ...nextMeta }))
      const nextSearched = new Set(searchedSubquestions)
      nextSearched.add(normalizedKey)
      setSearchedSubquestions(nextSearched)
      persistPhase2State({
        ...nextMeta,
        searchedSubquestions: Array.from(nextSearched),
        subquestionLogs: nextLogs,
      })
      if (!searchedSubquestions.has(normalizedKey)) {
        showStatus(
          visibleResults.length > 0
            ? `${visibleResults.length} resultados para "${targetSubquestion}".`
            : `Sin resultados para "${targetSubquestion}".`,
        )
      } else {
        showStatus(
          visibleResults.length > 0
            ? `Resultados actualizados para "${targetSubquestion}".`
            : `Sin resultados para "${targetSubquestion}".`,
        )
      }
    } catch (error) {
      console.error('handleSearchSubquestion', error)
      showStatus('No pudimos ejecutar esa búsqueda. Intenta nuevamente.')
    } finally {
      setSearchingSubquestion(null)
      setLoading(false)
    }
  }

  const handleGenerateDocumentation = () => {
    if (!strategy) {
      showStatus('Necesitas una estrategia generada para documentarla.')
      return
    }
    if (!hasCompletedAllSubquestions) {
      showStatus('Completa y guarda los resultados de todas las subpreguntas antes de generar el informe.')
      return
    }

    const timestamp = Date.now()
    const humanDate = new Date(timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    const formatDateTime = (value?: number) => (value ? new Date(value).toLocaleString('es-ES') : 'Sin registro')

    const summaryLines = [
      `Fecha de registro: ${humanDate}`,
      `Pregunta principal: ${strategy.question || project.phase1?.mainQuestion || project.name}`,
      `Fuentes consultadas: ${formatSourceList(selectedSources)}`,
      `Rango de años aplicado: ${yearFilters.from} - ${yearFilters.to}`,
      '',
      'Subpreguntas documentadas:',
    ]

    visibleSubquestions.forEach((block, index) => {
      const key = normalizeSubquestionKey(block.subquestion)
      const log = subquestionLogs[key]
      const fallbackStrategies =
        block.databaseStrategies?.map((entry) => ({
          database: entry?.database ?? 'Base sin nombre',
          query: entry?.query ?? '',
        })) ?? []
      const sectionLines = [
        `#${index + 1} ${block.subquestion || 'Subpregunta sin título'}`,
        `- Fuentes usadas: ${formatSourceList(log?.selectedSources ?? selectedSources)}`,
        `- Búsqueda aplicada: ${(log?.keywords ?? block.keywords ?? []).join(', ') || 'Sin keywords registradas'}`,
        `- Resultados visibles: ${log?.totalResults ?? phase2Meta.lastSearchResultCount ?? 0}`,
        `- Candidatos guardados: ${log?.savedCount ?? 0}`,
        `- Última búsqueda: ${formatDateTime(log?.lastSearchAt)}`,
        `- Guardado el: ${formatDateTime(log?.savedAt)}`,
        `- Cadenas por base:`,
        ...(log?.databaseStrategies ?? fallbackStrategies).map(
          (entry) => `   · ${entry.database}: ${entry.query || 'Cadena no disponible'}`,
        ),
      ]
      if (!log) {
        sectionLines.push('   · Notas: esta subpregunta se completó antes de registrar los detalles automáticamente.')
      }
      sectionLines.push('')
      summaryLines.push(...sectionLines)
    })

    const summary = summaryLines.join('\n')
    setDocumentationSummary(summary)
    setPhase2Meta((prev) => ({ ...prev, documentationGeneratedAt: timestamp }))
    persistPhase2State({ documentationGeneratedAt: timestamp, documentationSummary: summary })
    showStatus('📄 Documentación de estrategia generada en español.')
  }

  const checklistItems = [
    {
      id: 'keywords',
      label: 'Extraer términos y sinónimos',
      completed: Boolean(strategy?.keywordMatrix?.length),
    },
    {
      id: 'queries',
      label: 'Diseñar cadenas de búsqueda (subpreguntas validadas)',
      completed: Boolean(strategy?.subquestionStrategies?.length),
    },
    {
      id: 'search',
      label: 'Buscar artículos (bases tradicionales)',
      completed: hasCompletedAllSubquestions,
    },
    {
      id: 'documentation',
      label: 'Documentar estrategia de búsqueda',
      completed: Boolean(phase2Meta.documentationGeneratedAt),
    },
  ]

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(papers.map((paper) => paper.id)))
  }

  const handleSaveCandidates = async () => {
    if (selectedPapers.length === 0 || !activeSubquestion) return
    setSaving(true)
    const { saved, duplicates, withoutAbstract } = await saveProjectCandidates(project.id, selectedPapers)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00FF00', '#00FFFF', '#FFD300'],
    })
    const statusParts = []
    statusParts.push(`${saved} candidatos guardados`)
    if (duplicates > 0) {
      statusParts.push(`${duplicates} duplicados omitidos`)
    }
    if (withoutAbstract > 0) {
      statusParts.push(`${withoutAbstract} registros sin resumen filtrados`)
    }
    showStatus(statusParts.join(' · '))
    setSelectedIds(new Set())
    setSaving(false)

    const activeKey = normalizeSubquestionKey(activeSubquestion)
    const prevLog = subquestionLogs[activeKey]
    const timestamp = Date.now()
    const strategyBlock = strategy?.subquestionStrategies.find(
      (block) => normalizeSubquestionKey(block.subquestion) === activeKey,
    )
    const databaseEntries =
      prevLog?.databaseStrategies ??
      (strategyBlock?.databaseStrategies ?? []).map((entry) => ({
        database: entry?.database ?? 'Base sin nombre',
        query: entry?.query ?? '',
      }))
    const nextLog: SubquestionLog = {
      subquestion: activeSubquestion,
      lastSearchAt: prevLog?.lastSearchAt ?? timestamp,
      savedAt: timestamp,
      selectedSources: prevLog?.selectedSources ?? selectedSources,
      yearFilters: prevLog?.yearFilters ?? yearFilters,
      keywords: prevLog?.keywords ?? strategyBlock?.keywords ?? [],
      databaseStrategies: databaseEntries,
      totalResults: prevLog?.totalResults ?? papers.length,
      savedCount: selectedPapers.length,
    }
    const nextLogs = { ...subquestionLogs, [activeKey]: nextLog }
    setSubquestionLogs(nextLogs)

    const nextLocked = new Set(lockedSubquestions)
    nextLocked.add(activeKey)
    setLockedSubquestions(nextLocked)
    persistPhase2State({
      lockedSubquestions: Array.from(nextLocked),
      subquestionLogs: nextLogs,
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <SearchHeader
            defaultQuestion={project.phase1?.mainQuestion ?? project.name}
            selectedSources={selectedSources}
            onToggleSource={handleToggleSource}
            onGenerateDerivation={handleGenerateDerivation}
            onGenerateSubquestionKeywords={handleGenerateSubquestionKeywords}
            canGenerateSubquestionKeywords={derivationReady && !derivationLoading}
            disabled={loading || derivationLoading || subquestionLoading}
          />
        </div>
        <div className="w-full lg:w-80">
          <Phase2Checklist items={checklistItems} />
        </div>
      </div>

      <section className="space-y-6">
        <div className="space-y-6">
          {derivationLoading ? (
            <div className="border-4 border-black bg-neutral-100 shadow-brutal p-6 font-mono text-main">
              ✨ Generando derivación de términos con tus datos de la Fase 1...
            </div>
          ) : null}
          {subquestionLoading ? (
            <div className="border-4 border-black bg-neutral-100 shadow-brutal p-6 font-mono text-main">
              🔁 Construyendo nuevas keywords para subpreguntas...
            </div>
          ) : null}

          {strategyError ? (
            <div className="border-4 border-accent-danger bg-white shadow-brutal p-6 font-mono text-main">
              {strategyError}
            </div>
          ) : null}

          {strategy && !derivationLoading ? (
            <StrategySummary
              strategy={strategy}
              subquestions={visibleSubquestions}
              onRemoveSubquestion={handleRemoveSubquestion}
              disableRemoval={visibleSubquestions.length <= 1}
              onSearchSubquestion={handleSearchSubquestion}
              searchingSubquestion={searchingSubquestion}
              activeSubquestion={activeSubquestion}
              selectedSources={selectedSources}
              onGenerateDocumentation={handleGenerateDocumentation}
              showDerivation={derivationReady}
              showSubquestions={subquestionReady}
              showDocumentation={hasCompletedAllSubquestions}
              canGenerateDocumentation={hasCompletedAllSubquestions}
              documentationSummary={documentationSummary}
              lockedSubquestions={lockedSubquestions}
            />
          ) : null}

          {searchPerformed && papers.length === 0 ? (
            <div className="border-4 border-dashed border-accent-success bg-neutral-900 text-text-main text-center py-20 px-8 shadow-brutal">
              <p className="text-3xl font-black uppercase">Sin resultados</p>
              <p className="font-mono mt-2">Ajusta tus fuentes o refina la pregunta para obtener nuevos hallazgos.</p>
            </div>
          ) : null}

          {papers.length > 0 ? (
            <div className="space-y-4">
              {activeSubquestion ? (
                <p className="text-sm font-mono text-main">
                  Resultados actuales para: <span className="font-bold">{activeSubquestion}</span>
                </p>
              ) : null}
              <div className="grid lg:grid-cols-2 gap-6">
                {papers.map((paper) => (
                  <PaperCard
                    key={`${paper.source}-${paper.id}`}
                    paper={paper}
                    selected={selectedIds.has(paper.id)}
                    onToggle={toggleSelection}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

      </section>

      {loading ? (
        <div className="fixed inset-0 bg-black/75 text-text-main flex items-center justify-center font-mono text-xl z-40 text-center px-6">
          {searchingSubquestion ? `🔍 Buscando papers para "${searchingSubquestion}"...` : 'Procesando búsqueda...'}
        </div>
      ) : null}

      {papers.length > 0 && !currentSubLocked ? (
        <div className="fixed bottom-0 left-0 right-0 bg-accent-success border-t-4 border-black p-4 flex flex-wrap items-center justify-between gap-4 text-main font-mono z-30">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="border-3 border-black px-4 py-2 bg-white text-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              onClick={toggleSelectAll}
            >
              {allVisibleSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            <span>{selectedIds.size} seleccionados</span>
          </div>
          <button
            type="button"
            className="border-4 border-black px-5 py-3 bg-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            onClick={handleSaveCandidates}
            disabled={saving || selectedIds.size === 0}
          >
            {saving ? 'Guardando...' : '💾 Guardar seleccionados'}
          </button>
        </div>
      ) : null}

      {statusMessage ? (
        <div className="fixed bottom-6 right-6 bg-neutral-100 border-4 border-black px-4 py-3 font-mono text-main shadow-brutal">
          {statusMessage}
        </div>
      ) : null}

    </div>
  )
}
