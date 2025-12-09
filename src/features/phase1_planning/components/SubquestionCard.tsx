type SubquestionCardProps = {
  index: number
  value: string
  onChange: (next: string) => void
  onRemove?: () => void
  disableRemove?: boolean
  badge?: string
}

export const SubquestionCard = ({
  index,
  value,
  onChange,
  onRemove,
  disableRemove = false,
  badge,
}: SubquestionCardProps) => {
  return (
    <div className="border-4 border-black bg-white shadow-brutal p-4 space-y-3">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-main">Subpregunta {index + 1}</span>
          {badge ? (
            <span className="inline-flex items-center gap-1 border-2 border-black px-2 py-0.5 text-xs font-mono bg-accent-secondary text-black">
              {badge}
            </span>
          ) : null}
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disableRemove}
            className={`text-xs font-mono uppercase tracking-[0.3em] border-2 border-black px-2 py-1 ${
              disableRemove ? 'opacity-40 cursor-not-allowed' : 'bg-accent-danger text-black'
            }`}
          >
            Quitar
          </button>
        ) : null}
      </header>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-3 border-black bg-neutral-100 p-3 font-mono text-sm text-main outline-none focus:bg-white"
        rows={3}
      />
    </div>
  )
}
