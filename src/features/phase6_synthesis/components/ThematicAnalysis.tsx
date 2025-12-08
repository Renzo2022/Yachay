import { useState } from 'react'
import type { Candidate } from '../../projects/types.ts'
import type { SynthesisTheme } from '../types.ts'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'

interface ThematicAnalysisProps {
  themes: SynthesisTheme[]
  studies: Candidate[]
  onAdd: (theme: Omit<SynthesisTheme, 'id'>) => Promise<void>
  onUpdate: (theme: SynthesisTheme) => Promise<void>
  onDelete: (themeId: string) => Promise<void>
}

export const ThematicAnalysis = ({ themes, studies, onAdd, onUpdate, onDelete }: ThematicAnalysisProps) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<SynthesisTheme, 'id'>>({ title: '', description: '', relatedStudies: [] })
  const [saving, setSaving] = useState(false)

  const toggleStudy = (studyId: string) => {
    setDraft((prev) => {
      const exists = prev.relatedStudies.includes(studyId)
      return {
        ...prev,
        relatedStudies: exists ? prev.relatedStudies.filter((id) => id !== studyId) : [...prev.relatedStudies, studyId],
      }
    })
  }

  const resetDraft = () => {
    setDraft({ title: '', description: '', relatedStudies: [] })
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!draft.title.trim()) return
    setSaving(true)
    if (editingId) {
      await onUpdate({ ...draft, id: editingId })
    } else {
      await onAdd(draft)
    }
    resetDraft()
    setSaving(false)
    setShowForm(false)
  }

  const startEditing = (theme: SynthesisTheme) => {
    setDraft({ title: theme.title, description: theme.description, relatedStudies: theme.relatedStudies })
    setEditingId(theme.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <section className="border-4 border-black bg-white shadow-[10px_10px_0_0_#111] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">Temas</p>
            <h3 className="text-2xl font-black">Análisis temático</h3>
          </div>
          <BrutalButton variant="primary" className="bg-[#F97316] text-white" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Cerrar' : '➕ Agregar Tema'}
          </BrutalButton>
        </div>

        {showForm ? (
          <div className="mt-6 border-4 border-black bg-neutral-50 p-4 space-y-4">
            <input
              className="w-full border-3 border-black px-3 py-2 font-mono"
              placeholder="Título del tema"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
            <textarea
              className="w-full border-3 border-black px-3 py-2 font-mono"
              placeholder="Descripción"
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
            <div className="max-h-40 overflow-auto border-3 border-dashed border-black p-3 space-y-2">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Estudios relacionados</p>
              {studies.map((study) => {
                const checked = draft.relatedStudies.includes(study.id)
                return (
                  <label key={study.id} className="flex items-center gap-2 text-sm font-mono">
                    <input type="checkbox" checked={checked} onChange={() => toggleStudy(study.id)} />
                    <span>{study.title}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex justify-end gap-3">
              <BrutalButton
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  resetDraft()
                }}
              >
                Cancelar
              </BrutalButton>
              <BrutalButton variant="primary" className="bg-[#F97316] text-white" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar tema' : 'Guardar tema'}
              </BrutalButton>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {themes.length === 0 ? (
          <p className="border-4 border-black bg-white shadow-[6px_6px_0_0_#111] p-4 font-mono text-sm text-neutral-600">
            Aún no has agregado temas. Usa el botón superior para registrar patrones.
          </p>
        ) : (
          themes.map((theme) => (
            <article key={theme.id} className="border-4 border-black bg-white shadow-[6px_6px_0_0_#111] p-4 space-y-3">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#F97316]">Tema</p>
                  <h4 className="text-xl font-black">{theme.title}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="border-3 border-black px-3 py-1 font-mono text-xs"
                    onClick={() => startEditing(theme)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="border-3 border-black px-3 py-1 font-mono text-xs bg-red-500 text-white"
                    onClick={() => onDelete(theme.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </header>
              <p className="font-mono text-sm text-neutral-700">{theme.description}</p>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">Estudios</p>
                <ul className="list-disc pl-5 text-sm">
                  {theme.relatedStudies.map((studyId) => (
                    <li key={studyId}>{studies.find((study) => study.id === studyId)?.title ?? 'Estudio'}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
