import { NavLink, useNavigate } from 'react-router-dom' // 1. Se añade useNavigate aquí
import { PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../lib/navigation.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Sidebar({ collapsed, onToggleCollapsed }) {
  const { user, puedeVerReunionesObispado, signOut } = useAuth()
  const navigate = useNavigate() // 2. Inicializamos el hook de navegación
  const iniciales = user?.nombre?.split(' ').map(p => p[0]).slice(0, 2).join('') ?? ''

  // 3. Creamos la función que maneja el cierre de sesión y la redirección
  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between shrink-0 h-full py-6 bg-surface-container-low border-r border-outline-variant/30 transition-all duration-200 ${
        collapsed ? 'w-20 px-2' : 'w-72 px-4'
      }`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold shrink-0">
                {iniciales}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary truncate">{user?.nombre}</p>
                <p className="text-xs text-on-surface-variant truncate capitalize">
                  {user?.organizaciones?.nombre && `${user.organizaciones.nombre}`}
                </p>
                <span className="text-xs text-secondary font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Sesión activa
                </span>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={`p-2 rounded-lg text-on-surface-variant hover:bg-surface-container shrink-0 ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
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
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collapsed ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`
                }
              >
                <Icon size={20} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {!collapsed && (
          <div className="p-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant">
            <p className="text-xs font-semibold text-primary">Manual General</p>
            <p className="text-xs mt-1 leading-relaxed">Capítulo 7: El Consejo de Barrio y ministerios.</p>
          </div>
        )}
        {/* 4. Cambiamos el onClick para que llame a handleSignOut en vez de signOut directamente */}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-error hover:bg-error-container/30 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
