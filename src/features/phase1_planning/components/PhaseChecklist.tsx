import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

type ChecklistItem = {
  id: string
  label: string
  completed: boolean
}

type PhaseChecklistProps = {
  items: ChecklistItem[]
}

export const PhaseChecklist = ({ items }: PhaseChecklistProps) => {
  const hasCelebrated = useRef(false)
  const allDone = items.every((item) => item.completed)

  useEffect(() => {
    if (allDone && !hasCelebrated.current) {
      hasCelebrated.current = true
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#FF005C', '#FFD300', '#00FFFF'],
      })
    }
    if (!allDone) {
      hasCelebrated.current = false
    }
  }, [allDone])

  return (
    <aside className="border-4 border-black bg-neutral-100 shadow-brutal rounded-none p-5 space-y-4">
      <header>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent-secondary">Checklist</p>
        <h3 className="text-2xl font-black uppercase text-main">Fase 1</h3>
      </header>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-3 border-3 border-black px-4 py-3 bg-white ${
              item.completed ? 'bg-accent-success/30' : ''
            }`}
          >
            <span
              className={`w-6 h-6 border-3 border-black flex items-center justify-center font-black ${
                item.completed ? 'bg-accent-success text-main' : 'bg-white'
              }`}
            >
              {item.completed ? '✔' : ''}
            </span>
            <span className="font-mono text-sm text-main">{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
