import type { Candidate } from '../../projects/types.ts'
import type { ExtractionData } from '../types.ts'

interface ExtractionMatrixRow {
  study: Candidate
  extraction?: ExtractionData
}

interface ExtractionMatrixTableProps {
  rows: ExtractionMatrixRow[]
}

const statusColors: Record<ExtractionData['status'] | 'empty', string> = {
  empty: 'bg-white text-black',
  extracted: 'bg-yellow-300 text-black',
  verified: 'bg-green-300 text-black',
}

export const ExtractionMatrixTable = ({ rows }: ExtractionMatrixTableProps) => {
  if (!rows.length) {
    return (
      <div className="border-4 border-dashed border-black bg-white text-center py-12 font-mono text-sm">
        No hay estudios disponibles para la matriz.
      </div>
    )
  }

  return (
    <div className="border-4 border-black bg-white shadow-[10px_10px_0_0_#111] overflow-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <thead className="bg-[#FF005C] text-white sticky top-0">
          <tr>
            {['Estudio', 'Muestra', 'Metodología', 'Intervención', 'Resultados', 'Limitaciones', 'Estado'].map((header) => (
              <th key={header} className="border-2 border-black px-4 py-3 text-left uppercase tracking-wide text-xs">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ study, extraction }) => {
            const statusKey = extraction?.status ?? 'empty'
            return (
              <tr key={study.id} className="odd:bg-neutral-50">
                <td className="border-2 border-black px-4 py-3">
                  <p className="text-base font-black text-neutral-900">{study.title}</p>
                  <p className="text-xs text-neutral-600">
                    {study.authors.join(', ')} · {study.year}
                  </p>
                </td>
                <td className="border-2 border-black px-4 py-3">
                  <p className="font-bold text-lg">{extraction?.sample.size ?? '—'}</p>
                  <p className="text-xs text-neutral-600">{extraction?.sample.description ?? 'Sin registrar'}</p>
                </td>
                <td className="border-2 border-black px-4 py-3">
                  <p className="font-semibold">{extraction?.methodology.design ?? '—'}</p>
                  <p className="text-xs text-neutral-600">{extraction?.methodology.duration ?? '—'}</p>
                </td>
                <td className="border-2 border-black px-4 py-3">
                  <p>{extraction?.intervention.description ?? '—'}</p>
                  <p className="text-xs text-neutral-600">
                    {extraction?.intervention.tools?.length ? extraction.intervention.tools.join(', ') : 'Sin herramientas'}
                  </p>
                </td>
                <td className="border-2 border-black px-4 py-3">
                  <p className="font-semibold">{extraction?.outcomes.primary ?? '—'}</p>
                  <p className="text-xs text-neutral-600">{extraction?.outcomes.results ?? '—'}</p>
                </td>
                <td className="border-2 border-black px-4 py-3">
                  <ul className="list-disc pl-4 space-y-1">
                    {extraction?.limitations?.length ? (
                      extraction.limitations.map((limitation, index) => <li key={`${study.id}-${index}`}>{limitation}</li>)
                    ) : (
                      <li className="text-neutral-500">Sin registrar</li>
                    )}
                  </ul>
                </td>
                <td className="border-2 border-black px-4 py-3">
                  <span className={`inline-flex items-center justify-center px-3 py-1 border-2 border-black text-xs uppercase tracking-wide ${statusColors[statusKey]}`}>
                    {statusKey === 'empty' ? 'Pendiente' : statusKey}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
