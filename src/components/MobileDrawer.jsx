import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV_ITEMS } from '../lib/navigation.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function MobileDrawer({ open, onClose }) {
  const { puedeVerReunionesObispado } = useAuth()

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-primary/20 backdrop-blur-xs z-40 lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-container-low shadow-md p-4 flex flex-col gap-4 transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <span className="text-sm font-semibold text-on-surface-variant">Navegación del Consejo</span>
          <button onClick={onClose} aria-label="Cerrar menú" className="p-1 text-on-surface-variant">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, restringido }) => {
            if (restringido && !puedeVerReunionesObispado) return null
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container'
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
