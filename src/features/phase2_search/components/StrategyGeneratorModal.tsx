import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import type { ExternalSource, Phase2Strategy } from '../types.ts'

type StrategySummaryProps = {
  strategy: Phase2Strategy
  subquestions?: Phase2Strategy['subquestionStrategies']
  onRemoveSubquestion?: (subquestion: string) => void
  disableRemoval?: boolean
  onSearchSubquestion?: (subquestion: Phase2Strategy['subquestionStrategies'][number]) => void
  searchingSubquestion?: string | null
  activeSubquestion?: string | null
  selectedSources?: ExternalSource[]
  onGenerateDocumentation?: () => void
  showDerivation?: boolean
  showSubquestions?: boolean
  showDocumentation?: boolean
  canGenerateDocumentation?: boolean
  documentationSummary?: string | null
  lockedSubquestions?: Set<string>
}

const normalizeSubquestionKey = (value?: string | null): string => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : 'Subpregunta sin título'
}

const COMPONENT_STYLES: Record<
  Phase2Strategy['keywordMatrix'][number]['component'],
  { label: string; color: string; conceptColor: string }
> = {
  P: { label: 'P · Población', color: 'text-[#3b82f6]', conceptColor: 'text-[#3b82f6]' },
  I: { label: 'I · Intervención', color: 'text-[#22c55e]', conceptColor: 'text-[#30c86d]' },
  C: { label: 'C · Comparación', color: 'text-[#f97316]', conceptColor: 'text-[#f9733c]' },
  O: { label: 'O · Resultados', color: 'text-[#9333ea]', conceptColor: 'text-[#af50ea]' },
}

export const StrategySummary = ({
  strategy,
  subquestions,
  onRemoveSubquestion,
  disableRemoval = false,
  onSearchSubquestion,
  searchingSubquestion,
  activeSubquestion,
  selectedSources,
  onGenerateDocumentation,
  showDerivation = true,
  showSubquestions = true,
  showDocumentation = true,
  canGenerateDocumentation = false,
  documentationSummary = null,
  lockedSubquestions,
}: StrategySummaryProps) => {
  const keywordMatrix = strategy.keywordMatrix ?? []
  const displayedSubquestions = subquestions ?? strategy.subquestionStrategies ?? []

  return (
    <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none p-6 space-y-8 text-black">
      <header className="border-b-3 border-black pb-4 space-y-1">
        <p className="text-xs offenbar font-mono uppercase tracking-[0.3em] text-black">Estrategia generada</p>
        <h3 className="text-3xl font-black uppercase text-black">Resumen de derivaciones PICO y subpreguntas</h3>
        <p className="font-mono text-sm text-black">Basada en la pregunta principal definida en Fase 1.</p>
      </header>

      {showDerivation ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-black uppercase text-black">1. Derivación de términos (PICO)</h4>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-black">
              Bases seleccionadas:{' '}
              {selectedSources && selectedSources.length > 0 ? selectedSources.join(' · ') : 'Selecciona al menos una base'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-3 border-black text-left font-mono text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="border-b-3 border-black px-4 py-2 text-black">Componente</th>
                  <th className="border-b-3 border-black px-4 py-2 text-black">Concepto central</th>
                  <th className="border-b-3 border-black px-4 py-2 text-black">Términos y sinónimos sugeridos</th>
                </tr>
              </thead>
              <tbody>
                {keywordMatrix.map((entry) => {
                  const meta = COMPONENT_STYLES[entry.component]
                  return (
                    <tr key={`${entry.component}-${entry.concept}`}>
                      <td className={`border-b-3 border-black px-4 py-3 font-bold ${meta.color}`}>{meta.label}</td>
                      <td className={`border-b-3 border-black px-4 py-3 font-semibold ${meta.conceptColor}`}>{entry.concept}</td>
                      <td className="border-b-3 border-black px-4 py-3 text-black">
                        <span className="block whitespace-pre-wrap">{entry.terms.join(' OR ')}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {showSubquestions ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h4 className="text-2xl font-black uppercase text-black">2. Subpreguntas · Keywords · Cadenas</h4>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-black">
              PubMed · Semantic Scholar · CrossRef · Europe PMC
            </span>
          </div>
          <p className="font-mono text-sm text-black">
            Si deseas recuperar todos los resultados de cada base, espera al menos 5 minutos entre solicitudes consecutivas
            para evitar saturar las APIs federadas y garantizar respuestas completas.
          </p>
          <div className="space-y-4 text-black">
            {displayedSubquestions.length === 0 ? (
              <article className="border-3 border-dashed border-black p-4 bg-neutral-50">
                <p className="font-mono text-sm text-black">
                  Todas las subpreguntas fueron descartadas. Restaura o vuelve a generar la estrategia para continuar.
                </p>
              </article>
            ) : null}

            {displayedSubquestions.map((block, index) => {
              const normalizedKey = normalizeSubquestionKey(block?.subquestion)
              const isLocked = lockedSubquestions?.has(normalizedKey)

              return (
                <article
                  key={block?.subquestion ?? `subquestion-${index}`}
                  className={`border-3 border-black p-4 space-y-4 bg-neutral-50 ${
                    activeSubquestion && activeSubquestion === block?.subquestion ? 'ring-4 ring-accent-secondary' : ''
                  }`}
                >
                  <header className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-[0.3em] text-black">
                          Subpregunta #{index + 1}
                        </p>
                        <h5 className="text-xl font-black uppercase text-black">{block?.subquestion ?? 'Subpregunta sin título'}</h5>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {isLocked ? (
                          <span className="border-2 border-black bg-accent-success text-main px-2 py-1 text-xs font-mono uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            Completada
                          </span>
                        ) : null}
                        {onSearchSubquestion && !isLocked ? (
                          <BrutalButton
                            variant="secondary"
                            size="sm"
                            className="bg-accent-secondary text-black border-black"
                            onClick={() => onSearchSubquestion(block)}
                            disabled={
                              disableRemoval ||
                              !block?.databaseStrategies?.length ||
                              Boolean(searchingSubquestion && searchingSubquestion !== block?.subquestion)
                            }
                          >
                            {searchingSubquestion === block?.subquestion ? 'Buscando...' : 'Buscar papers'}
                          </BrutalButton>
                        ) : null}
                        {onRemoveSubquestion ? (
                          <button
                            type="button"
                            className="border-3 border-black px-3 py-1 text-xs font-mono uppercase bg-accent-danger text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                            onClick={() => block?.subquestion && onRemoveSubquestion(block.subquestion)}
                          >
                            Eliminar
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </header>

                  <div className="space-y-2">
                    <p className="font-mono text-sm text-black">Palabras clave derivadas</p>
                    <div className="flex flex-wrap gap-2">
                      {(block?.keywords ?? []).map((keyword) => (
                        <span
                          key={keyword}
                          className="border-2 border-black bg-white px-3 py-1 text-xs font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto border-3 border-black bg-white">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-neutral-100">
                        <tr>
                          <th className="border-b-3 border-black px-3 py-2">Base</th>
                          <th className="border-b-3 border-black px-3 py-2">Cadena de búsqueda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(block?.databaseStrategies ?? []).map((entry, dbIndex) => {
                          const database = entry?.database ?? 'Base sin nombre'
                          const query = entry?.query ?? 'Cadena no disponible'
                          return (
                            <tr key={`${block?.subquestion ?? 'sub'}-${database}-${dbIndex}`} className="odd:bg-neutral-50">
                              <td className="border-b-3 border-black px-3 py-2 font-bold">{database}</td>
                              <td className="border-b-3 border-black px-3 py-2">
                                <code className="block whitespace-pre-wrap">{query}</code>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}

      {showDocumentation ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div>
                <h4 className="text-2xl font-black uppercase text-black">3. Documentación de la estrategia</h4>
                {documentationSummary ? (
                  <p className="font-mono text-sm text-black whitespace-pre-wrap">{documentationSummary}</p>
                ) : (
                  <p className="font-mono text-sm text-black">
                    Ejecuta al menos una búsqueda y luego genera un registro en español con el botón lateral.
                  </p>
                )}
              </div>
            </div>
            {onGenerateDocumentation ? (
              <BrutalButton
                variant="primary"
                className="self-start"
                disabled={!canGenerateDocumentation}
                onClick={onGenerateDocumentation}
              >
                {documentationSummary ? '↻ Regenerar documentación' : '📄 Generar documentación'}
              </BrutalButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
