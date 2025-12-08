import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import type { SearchStrategy } from '../types.ts'

type StrategyGeneratorModalProps = {
  strategies: SearchStrategy[]
  onClose: () => void
}

export const StrategyGeneratorModal = ({ strategies, onClose }: StrategyGeneratorModalProps) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
    <BrutalCard title="Estrategias generadas por IA" className="w-full max-w-4xl bg-neutral-100 space-y-6">
      <p className="font-mono text-main">
        Copia estas cadenas y pásalas a tus fuentes especializadas. Ajustaremos filtros por fecha y área en cada motor.
      </p>
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.database} className="border-3 border-black p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <header className="flex items-center justify-between">
              <h4 className="text-xl font-black uppercase text-main">{strategy.database}</h4>
              <BrutalButton
                variant="secondary"
                size="sm"
                onClick={() => navigator.clipboard.writeText(strategy.query)}
                className="bg-accent-success text-main border-black"
              >
                Copiar
              </BrutalButton>
            </header>
            <code className="block whitespace-pre-wrap font-mono text-sm text-main">{strategy.query}</code>
            {strategy.notes ? <p className="text-xs font-mono text-neutral-900">{strategy.notes}</p> : null}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <BrutalButton variant="primary" onClick={onClose}>
          Cerrar
        </BrutalButton>
      </div>
    </BrutalCard>
  </div>
)
