import { NavLink, Outlet } from 'react-router-dom'
import { BrutalButton } from '../ui-kit/BrutalButton.tsx'
import { useAuth } from '../../features/auth/AuthContext.tsx'

const dashboardLinks = [{ path: '/', label: 'Dashboard' }]

export const AppLayout = () => {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <header className="border-b-4 border-black bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-700">Yachay AI</span>
          <h1 className="text-2xl font-bold">Systematic Review Command Center</h1>
        </div>
        <BrutalButton variant="secondary" onClick={signOut}>
          Cerrar sesión
        </BrutalButton>
      </header>

      <nav className="bg-neutral-100 text-neutral-900 border-b-4 border-black px-4 py-3 flex flex-wrap gap-2">
        {dashboardLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              [
                'px-3 py-2 border-3 border-black font-mono text-xs uppercase tracking-tight transition-all',
                'shadow-[3px_3px_0px_0px_#000000]',
                isActive ? 'bg-accent-secondary text-black' : 'bg-white hover:-translate-y-0.5 hover:-translate-x-0.5',
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-6 py-8 bg-neutral-100">
        <div className="max-w-6xl mx-auto border-4 border-black bg-white shadow-[8px_8px_0_0_#111] p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
