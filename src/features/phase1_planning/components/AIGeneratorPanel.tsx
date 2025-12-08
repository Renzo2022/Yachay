import { useState } from 'react'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { BrutalInput } from '../../../core/ui-kit/BrutalInput.tsx'

type AIGeneratorPanelProps = {
  initialTopic: string
  onGenerate: (topic: string) => Promise<void>
}

export const AIGeneratorPanel = ({ initialTopic, onGenerate }: AIGeneratorPanelProps) => {
  const [topic, setTopic] = useState(initialTopic)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Describe tu tema antes de invocar la IA.')
      return
    }
    setError(null)
    setLoading(true)
    await onGenerate(topic.trim())
    setLoading(false)
  }

  return (
    <section className="border-4 border-black bg-neutral-100 p-6 shadow-brutal rounded-none space-y-4">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-accent-secondary">Asistente IA</p>
        <h3 className="text-3xl font-black uppercase text-main">Generador PICO inteligente</h3>
      </header>
      <BrutalInput
        label="Describe tu tema de investigación"
        multiline
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        error={error ?? undefined}
      />
      <div className="flex flex-wrap items-center gap-4">
        <BrutalButton
          variant="secondary"
          className="bg-accent-secondary text-main border-black flex-1"
          onClick={handleGenerate}
          disabled={loading}
        >
          🤖 Generar Protocolo Mágico
        </BrutalButton>
        {loading ? (
          <div className="flex items-center gap-3 font-mono text-sm text-main">
            <div className="w-4 h-4 border-3 border-black bg-accent-secondary animate-square-blink" />
            <div className="w-4 h-4 border-3 border-black bg-accent-primary animate-square-blink" />
            <div className="w-4 h-4 border-3 border-black bg-accent-warning animate-square-blink" />
            <span>La IA está estructurando tu protocolo...</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
