import { useParams } from 'react-router-dom'
import { BrutalCard } from '../../../core/ui-kit/BrutalCard.tsx'

export const ProjectDetailPlaceholder = () => {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="space-y-6">
      <BrutalCard title="DETALLE DEL PROYECTO" className="bg-neutral-100">
        <p className="font-mono text-main text-xl">
          Detalle del proyecto ID: <span className="font-black">{projectId}</span>
        </p>
      </BrutalCard>
    </div>
  )
}
