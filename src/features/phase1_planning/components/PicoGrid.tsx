import { BrutalInput } from '../../../core/ui-kit/BrutalInput.tsx'

type PicoGridProps = {
  pico: {
    population: string
    intervention: string
    comparison: string
    outcome: string
  }
  onChange: (key: keyof PicoGridProps['pico'], value: string) => void
  aiBadgeFor: (field: string) => boolean
}

const CARD_STYLES: Record<keyof PicoGridProps['pico'], string> = {
  population: 'border-blue-500',
  intervention: 'border-green-500',
  comparison: 'border-orange-500',
  outcome: 'border-purple-600',
}

const LABELS: Record<keyof PicoGridProps['pico'], string> = {
  population: 'P · Población',
  intervention: 'I · Intervención',
  comparison: 'C · Comparación',
  outcome: 'O · Resultados',
}

export const PicoGrid = ({ pico, onChange, aiBadgeFor }: PicoGridProps) => (
  <section className="grid gap-4 md:grid-cols-2">
    {Object.entries(pico).map(([key, value]) => {
      const typedKey = key as keyof PicoGridProps['pico']
      return (
        <div key={key} className={`border-4 ${CARD_STYLES[typedKey]} bg-neutral-100 p-4 shadow-brutal`}>
          <BrutalInput
            label={LABELS[typedKey]}
            multiline
            value={value}
            onChange={(event) => onChange(typedKey, event.target.value)}
            badge={aiBadgeFor(`pico.${typedKey}`) ? '🤖 IA' : undefined}
          />
        </div>
      )
    })}
  </section>
)
