type PrismaDiagramProps = {
  data: {
    identified: number
    withoutAbstract: number
    duplicates: number
    screened: number
    included: number
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
    <Box title="Registros descartados sin resumen" value={data.withoutAbstract} />
    <div className="w-1 h-8 bg-black" />
    <Box title="Registros cribados" value={data.screened} />
    <div className="w-1 h-8 bg-black" />
    <Box title="Registros incluidos tras cribado" value={data.included} />
  </div>
)
