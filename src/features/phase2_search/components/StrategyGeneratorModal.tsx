import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import type { Phase2Strategy } from '../types.ts'

type StrategySummaryProps = {
  strategy: Phase2Strategy
}

const COMPONENT_STYLES: Record<
  Phase2Strategy['keywordMatrix'][number]['component'],
  { label: string; color: string }
> = {
  P: { label: 'P · Población', color: 'text-[#3b82f6]' },
  I: { label: 'I · Intervención', color: 'text-[#22c55e]' },
  C: { label: 'C · Comparación', color: 'text-[#f97316]' },
  O: { label: 'O · Resultados', color: 'text-[#9333ea]' },
}

export const StrategySummary = ({ strategy }: StrategySummaryProps) => {
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('copy strategy failed', error)
    }
  }

  return (
    <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none p-6 space-y-6">
      <header className="border-b-3 border-black pb-4 space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-900">Estrategia generada</p>
        <h3 className="text-3xl font-black uppercase text-main">Pregunta objetivo</h3>
        <p className="font-mono text-main">{strategy.question}</p>
      </header>

      <div className="space-y-3">
        <h4 className="text-2xl font-black uppercase text-main">1. Derivación de términos (PICO)</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-3 border-black text-left font-mono text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="border-b-3 border-black px-4 py-2">Componente</th>
                <th className="border-b-3 border-black px-4 py-2">Concepto central</th>
                <th className="border-b-3 border-black px-4 py-2">Términos y sinónimos sugeridos</th>
              </tr>
            </thead>
            <tbody>
              {strategy.keywordMatrix.map((entry) => {
                const meta = COMPONENT_STYLES[entry.component]
                return (
                  <tr key={`${entry.component}-${entry.concept}`}>
                    <td className={`border-b-3 border-black px-4 py-3 font-bold ${meta.color}`}>{meta.label}</td>
                    <td className="border-b-3 border-black px-4 py-3">{entry.concept}</td>
                    <td className="border-b-3 border-black px-4 py-3">
                      <span className="block whitespace-pre-wrap">{entry.terms.join(' OR ')}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-black uppercase text-main">2. Cadenas de búsqueda por base</h4>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-900">
            PubMed · Semantic Scholar · CrossRef · Europe PMC
          </span>
        </div>
        <div className="overflow-x-auto border-3 border-black">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="border-b-3 border-black px-4 py-2">Base</th>
                <th className="border-b-3 border-black px-4 py-2">Cadena de búsqueda</th>
                <th className="border-b-3 border-black px-4 py-2">Filtros</th>
                <th className="border-b-3 border-black px-4 py-2"># esperado</th>
                <th className="border-b-3 border-black px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {strategy.databaseStrategies.map((entry) => (
                <tr key={entry.database} className="bg-white odd:bg-neutral-50">
                  <td className="border-b-3 border-black px-4 py-3 font-bold">{entry.database}</td>
                  <td className="border-b-3 border-black px-4 py-3">
                    <code className="block whitespace-pre-wrap text-xs">{entry.query}</code>
                  </td>
                  <td className="border-b-3 border-black px-4 py-3">{entry.filters}</td>
                  <td className="border-b-3 border-black px-4 py-3">{entry.estimatedResults}</td>
                  <td className="border-b-3 border-black px-4 py-3 text-center">
                    <BrutalButton
                      variant="secondary"
                      size="sm"
                      className="bg-accent-success text-main border-black"
                      onClick={() => handleCopy(entry.query)}
                    >
                      Copiar
                    </BrutalButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-2xl font-black uppercase text-main">3. Documentación de la estrategia</h4>
        <ul className="list-disc list-inside font-mono text-sm text-main space-y-2">
          {strategy.recommendations.map((tip, index) => (
            <li key={`${tip}-${index}`}>{tip}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
