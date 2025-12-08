import { useEffect, useState } from 'react'
import type { Candidate } from '../../projects/types.ts'
import type { ExtractionData } from '../types.ts'
import { createEmptyExtraction } from '../types.ts'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'

interface DataEditorModalProps {
  open: boolean
  study: Candidate | null
  extraction?: ExtractionData
  preview: string
  onClose: () => void
  onSave: (data: ExtractionData) => Promise<void>
}

export const DataEditorModal = ({ open, study, extraction, preview, onClose, onSave }: DataEditorModalProps) => {
  const [draft, setDraft] = useState<ExtractionData | null>(null)
  const [limitationInput, setLimitationInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !study) return
    const base = extraction ?? createEmptyExtraction(study.id)
    setDraft(base)
    setLimitationInput(base.limitations.join('\n'))
  }, [open, study, extraction])

  if (!open || !study || !draft) return null

  const updateDraft = (updater: (current: ExtractionData) => ExtractionData) => {
    setDraft((current) => (current ? updater(current) : current))
  }

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const payload: ExtractionData = {
        ...draft,
        limitations: limitationInput
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        status: 'verified',
      }
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_#111] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <header className="border-b-4 border-black bg-accent-primary text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em]">Fase 5 · Extracción</p>
            <h2 className="text-2xl font-black">{study.title}</h2>
          </div>
          <button onClick={onClose} className="font-mono text-xl border-3 border-white px-3 py-1">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto grid lg:grid-cols-2 gap-0">
          <div className="border-r-4 border-black bg-neutral-900 text-white p-6 space-y-4">
            <h3 className="text-xl font-black">Resumen del texto</h3>
            <p className="text-sm font-mono whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {preview || 'No hay texto previo. Ejecuta la extracción automática para obtener un resumen.'}
            </p>
          </div>

          <form className="bg-white p-6 space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Muestra</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input
                  type="number"
                  className="border-3 border-black px-3 py-2 font-mono"
                  value={draft.sample.size}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      sample: { ...current.sample, size: Number(event.target.value) },
                    }))
                  }
                />
                <input
                  type="text"
                  className="border-3 border-black px-3 py-2 font-mono"
                  placeholder="Descripción"
                  value={draft.sample.description}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      sample: { ...current.sample, description: event.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Metodología</label>
                <input
                  type="text"
                  className="border-3 border-black px-3 py-2 font-mono mt-2"
                  placeholder="Diseño"
                  value={draft.methodology.design}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      methodology: { ...current.methodology, design: event.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Duración</label>
                <input
                  type="text"
                  className="border-3 border-black px-3 py-2 font-mono mt-2"
                  placeholder="8 semanas..."
                  value={draft.methodology.duration}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      methodology: { ...current.methodology, duration: event.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Intervención</label>
              <textarea
                className="border-3 border-black px-3 py-2 font-mono w-full mt-2"
                rows={3}
                value={draft.intervention.description}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    intervention: { ...current.intervention, description: event.target.value },
                  }))
                }
              />
              <input
                type="text"
                className="border-3 border-black px-3 py-2 font-mono w-full mt-2"
                placeholder="Herramientas separadas por coma"
                value={draft.intervention.tools.join(', ')}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    intervention: {
                      ...current.intervention,
                      tools: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Resultado primario</label>
                <textarea
                  className="border-3 border-black px-3 py-2 font-mono w-full mt-2"
                  rows={3}
                  value={draft.outcomes.primary}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      outcomes: { ...current.outcomes, primary: event.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Resultados</label>
                <textarea
                  className="border-3 border-black px-3 py-2 font-mono w-full mt-2"
                  rows={3}
                  value={draft.outcomes.results}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      outcomes: { ...current.outcomes, results: event.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Limitaciones (1 por línea)</label>
              <textarea
                className="border-3 border-black px-3 py-2 font-mono w-full mt-2"
                rows={4}
                value={limitationInput}
                onChange={(event) => setLimitationInput(event.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="border-t-4 border-black bg-neutral-900 p-4 flex justify-end gap-3">
          <BrutalButton variant="secondary" onClick={onClose} className="bg-white text-black">
            Cancelar
          </BrutalButton>
          <BrutalButton
            variant="primary"
            className="bg-accent-primary text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : '💾 Confirmar Datos'}
          </BrutalButton>
        </div>
      </div>
    </div>
  )
}
