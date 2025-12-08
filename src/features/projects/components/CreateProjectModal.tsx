import { useState } from 'react'
import { BrutalButton } from '../../../core/ui-kit/BrutalButton.tsx'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'
import { BrutalInput } from '../../../core/ui-kit/BrutalInput.tsx'

type CreateProjectModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: CreateProjectModalProps) => {
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (projectName.trim().length < 5) {
      setError('El nombre debe tener al menos 5 caracteres.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onCreate(projectName.trim())
      setProjectName('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <BrutalCard title="NUEVO PROYECTO" className="w-full max-w-xl bg-neutral-100">
        <div className="space-y-6">
          <p className="font-mono text-main">
            Define un nombre contundente para tu revisión sistemática. Podrás editarlo más adelante.
          </p>
          <BrutalInput
            label="Nombre del proyecto"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            error={error}
            disabled={submitting}
          />
          <div className="flex justify-end gap-4">
            <BrutalButton variant="secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </BrutalButton>
            <BrutalButton variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Proyecto'}
            </BrutalButton>
          </div>
        </div>
      </BrutalCard>
    </div>
  )
}
