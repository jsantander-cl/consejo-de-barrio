import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, Lock, ChevronDown, Calendar, UserCheck } from 'lucide-react'
import { NAV_ITEMS } from '../lib/navigation.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function MobileDrawer({ open, onClose }) {
  const { puedeVerReunionesObispado } = useAuth()
  const location = useLocation()
  
  // Estado para controlar si el menú desplegable de Obispado está abierto en móvil
  const [obispadoAbierto, setObispadoAbierto] = useState(
    location.pathname.includes('/obispado') || location.pathname.includes('/reuniones/obispado')
  )

  const esObispadoActivo = location.pathname.includes('/obispado') || location.pathname.includes('/reuniones/obispado')

  // Filtramos NAV_ITEMS igual que en el sidebar de escritorio
  const itemsFiltrados = NAV_ITEMS.filter(
    item => !item.to.includes('obispado') && !item.restringido
  )

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-primary/20 backdrop-blur-xs z-40 lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-container-low shadow-md p-4 flex flex-col gap-4 transition-transform duration-200 lg:hidden overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <span className="text-sm font-semibold text-on-surface-variant">Navegación del Consejo</span>
          <button onClick={onClose} aria-label="Cerrar menú" className="p-1 text-on-surface-variant cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {/* 1. Primer elemento: Tablero General */}
          {itemsFiltrados.slice(0, 1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* 2. SEGUNDA POSICIÓN: Menú desplegable independiente de Obispado */}
          {puedeVerReunionesObispado && (
            <div className="flex flex-col mt-0.5">
              <button
                type="button"
                onClick={() => setObispadoAbierto(!obispadoAbierto)}
                className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full cursor-pointer ${
                  esObispadoActivo
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock size={20} />
                  <span>Obispado</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${obispadoAbierto ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Sub-botones desplegables */}
              {obispadoAbierto && (
                <div className="flex flex-col gap-1 pl-4 mt-1 border-l-2 border-secondary/30 ml-4">
                  <NavLink
                    to="/reuniones/obispado"
                    onClick={onClose}
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
                    onClick={onClose}
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

          {/* 3. Resto de elementos a partir de la tercera posición */}
          {itemsFiltrados.slice(1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}