import type { QualityStats as Stats } from '../hooks/useQuality.ts'

const levelLabels: { key: keyof Stats; label: string; bg: string }[] = [
  { key: 'high', label: 'Alta', bg: 'bg-green-400' },
  { key: 'medium', label: 'Media', bg: 'bg-yellow-300' },
  { key: 'low', label: 'Baja', bg: 'bg-red-500' },
]

interface QualityStatsProps {
  stats: Stats
}

export const QualityStats = ({ stats }: QualityStatsProps) => {
  const total = stats.high + stats.medium + stats.low
  return (
    <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_#111] p-5 space-y-5">
      <header>
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-purple-500">F4 · Calidad</p>
        <h2 className="text-2xl font-black text-neutral-900">Estado global</h2>
        <p className="text-sm font-mono text-neutral-600">{total} estudios evaluados</p>
      </header>

      <div className="space-y-4">
        {levelLabels.map(({ key, label, bg }) => {
          const value = stats[key]
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex justify-between text-sm font-mono text-neutral-900">
                <span>{label}</span>
                <span>
                  {value} · {percentage}%
                </span>
              </div>
              <div className="h-6 border-3 border-black bg-neutral-100">
                <div className={`h-full ${bg}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
