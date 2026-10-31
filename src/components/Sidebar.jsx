import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, LogOut, Lock, ChevronDown, UserCheck, Calendar, CalendarClock } from 'lucide-react'
import { NAV_ITEMS } from '../lib/navigation.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Sidebar({ collapsed, onToggleCollapsed }) {
  const { user, puedeVerReunionesObispado, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Estado para controlar si el menú desplegable de Obispado está abierto
  const [obispadoAbierto, setObispadoAbierto] = useState(
    location.pathname.includes('/obispado') || location.pathname.includes('/reuniones/obispado')
  )

  const iniciales = user?.nombre?.split(' ').map(p => p[0]).slice(0, 2).join('') ?? ''

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  // Verificamos rutas de forma independiente y estricta
  const esObispadoActivo = location.pathname.includes('/obispado') || location.pathname.includes('/reuniones/obispado')
  const esConsejoBarrioActivo = location.pathname === '/reuniones'

  // Filtramos NAV_ITEMS excluyendo Tablero General (índice 0), Obispado, Consejo de Barrio y restricciones
  const itemsSecundarios = NAV_ITEMS.slice(1).filter(
    item => !item.to.includes('obispado') && item.to !== '/reuniones' && !item.restringido
  )

  // Buscamos el icono original de Consejo de Barrio desde NAV_ITEMS si existe, o usamos un respaldo con reloj
  const itemConsejoOriginal = NAV_ITEMS.find(item => item.to === '/reuniones')
  const IconoConsejo = itemConsejoOriginal ? itemConsejoOriginal.icon : CalendarClock

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
          {/* 1. PRIMER ELEMENTO: Tablero General (Inicio /) */}
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-2' : ''
                } ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`
              }
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* 2. SEGUNDO ELEMENTO: Menú desplegable independiente de Obispado */}
          {puedeVerReunionesObispado && (
            <div className="flex flex-col mt-0.5">
              <button
                onClick={() => setObispadoAbierto(!obispadoAbierto)}
                title={collapsed ? 'Obispado' : undefined}
                className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full cursor-pointer ${
                  collapsed ? 'justify-center px-2' : ''
                } ${
                  esObispadoActivo
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock size={20} />
                  {!collapsed && <span>Obispado</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${obispadoAbierto ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Sub-botones desplegables */}
              {obispadoAbierto && !collapsed && (
                <div className="flex flex-col gap-1 pl-4 mt-1 border-l-2 border-secondary/30 ml-4">
                  <NavLink
                    to="/reuniones/obispado"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`
                    }
                  >
                    <Calendar size={15} />
                    <span>Agenda de Obispado</span>
                  </NavLink>

                  <NavLink
                    to="/obispado/entrevistas"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`
                    }
                  >
                    <UserCheck size={15} />
                    <span>Control de Entrevistas</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* 3. TERCER ELEMENTO: Consejo de Barrio con su icono original del relojito */}
          <NavLink
            to="/reuniones"
            title={collapsed ? "Consejo de Barrio" : undefined}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              collapsed ? 'justify-center px-2' : ''
            } ${
              esConsejoBarrioActivo
                ? 'bg-secondary-container text-on-secondary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <IconoConsejo size={20} />
            {!collapsed && <span>Consejo de Barrio</span>}
          </NavLink>

          {/* 4. Resto de elementos del menú general (Compromisos, Senda de Convenios, etc.) */}
          {itemsSecundarios.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-2' : ''
                } ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`
              }
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {!collapsed && (
          <div className="p-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant">
            <p className="text-xs font-semibold text-primary">Manual General</p>
            <p className="text-xs mt-1 leading-relaxed">Capítulo 7: El Consejo de Barrio y ministerios.</p>
          </div>
        )}
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