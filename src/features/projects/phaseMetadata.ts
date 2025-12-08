import type { PhaseKey } from './types.ts'

export const phaseMetadata: Record<PhaseKey, { label: string; route: string; accent: string }> = {
  phase1: { label: 'F1 · Planificación', route: 'phase1', accent: '#F472B6' },
  phase2: { label: 'F2 · Búsqueda', route: 'phase2', accent: '#22D3EE' },
  phase3: { label: 'F3 · Cribado', route: 'phase3', accent: '#34D399' },
  phase4: { label: 'F4 · Calidad', route: 'phase4', accent: '#A78BFA' },
  phase5: { label: 'F5 · Extracción', route: 'phase5', accent: '#2563EB' },
  phase6: { label: 'F6 · Síntesis', route: 'phase6', accent: '#FB923C' },
  phase7: { label: 'F7 · Reporte', route: 'phase7', accent: '#EF4444' },
}
