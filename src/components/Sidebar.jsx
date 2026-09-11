import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/navigation.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Sidebar() {
  const { user, puedeVerReunionesObispado } = useAuth()
  const iniciales = user?.nombre?.split(' ').map(p => p[0]).slice(0, 2).join('') ?? ''

  return (
    <aside className="hidden lg:flex flex-col justify-between w-72 shrink-0 h-full py-6 px-4 bg-surface-container-low border-r border-outline-variant/30">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
          <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold shrink-0">
            {iniciales}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary truncate">{user?.nombre}</p>
            <p className="text-xs text-on-surface-variant truncate capitalize">{user?.rol?.replace('_', ' ')}</p>
            <span className="text-xs text-secondary font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Sesión activa
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, restringido }) => {
            if (restringido && !puedeVerReunionesObispado) return null
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="p-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant">
        <p className="text-xs font-semibold text-primary">Manual General</p>
        <p className="text-xs mt-1 leading-relaxed">
          Capítulo 7: El Consejo de Barrio y ministerios.
        </p>
      </div>
    </aside>
  )
}
