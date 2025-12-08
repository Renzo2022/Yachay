type PrismaDiagramProps = {
  data: {
    identified: number
    duplicates: number
    screened: number
    included: number
    additionalRecords: number
  }
}

const Box = ({ title, value }: { title: string; value: number }) => (
  <div className="border-3 border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center rounded-none">
    <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-900">{title}</p>
    <p className="text-2xl font-black text-main">n={value}</p>
  </div>
)

export const PrismaDiagram = ({ data }: PrismaDiagramProps) => (
  <div className="flex flex-col items-center gap-6">
    <Box title="Registros identificados a través de bases de datos" value={data.identified} />
    <div className="w-1 h-8 bg-black" />
    <Box title="Duplicados eliminados" value={data.duplicates} />

    <div className="w-1 h-8 bg-black" />
    <Box title="Registros cribados" value={data.screened} />

    <div className="grid gap-6 w-full max-w-3xl md:grid-cols-2 items-start">
      <div className="flex flex-col items-center gap-4">
        <Box title="Registros adicionales" value={data.additionalRecords} />
        <div className="w-1 h-8 bg-black" />
        <Box title="Registros incluidos tras cribado" value={data.included} />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 border-3 border-dashed border-black px-4 py-3 text-center font-mono text-sm">
          Flujo PRISMA
        </div>
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-black">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="black" />
            </marker>
          </defs>
          <line x1="10" y1="10" x2="110" y2="10" stroke="black" strokeWidth="4" markerEnd="url(#arrowhead)" />
          <line x1="110" y1="10" x2="110" y2="110" stroke="black" strokeWidth="4" markerEnd="url(#arrowhead)" />
          <line x1="110" y1="110" x2="10" y2="110" stroke="black" strokeWidth="4" markerEnd="url(#arrowhead)" />
          <line x1="10" y1="110" x2="10" y2="30" stroke="black" strokeWidth="4" markerEnd="url(#arrowhead)" />
        </svg>
      </div>
    </div>
  </div>
)
