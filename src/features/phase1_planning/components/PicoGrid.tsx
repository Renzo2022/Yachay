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
  population: 'border-[#3b82f6]',
  intervention: 'border-[#22c55e]',
  comparison: 'border-[#f97316]',
  outcome: 'border-[#9333ea]',
}

const LABELS: Record<keyof PicoGridProps['pico'], { text: string; color: string }> = {
  population: { text: 'P · Población', color: 'text-[#3b82f6]' },
  intervention: { text: 'I · Intervención', color: 'text-[#22c55e]' },
  comparison: { text: 'C · Comparación', color: 'text-[#f97316]' },
  outcome: { text: 'O · Resultados', color: 'text-[#9333ea]' },
}

export const PicoGrid = ({ pico, onChange, aiBadgeFor }: PicoGridProps) => (
  <section className="grid gap-4 md:grid-cols-2">
    {Object.entries(pico).map(([key, value]) => {
      const typedKey = key as keyof PicoGridProps['pico']
      return (
        <div key={key} className={`border-4 ${CARD_STYLES[typedKey]} bg-neutral-100 p-4 shadow-brutal`}>
          <BrutalInput
            label={LABELS[typedKey].text}
            labelClassName={LABELS[typedKey].color}
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
