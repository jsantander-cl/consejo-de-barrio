import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'

export default function TopBar({ onOpenDrawer, title = 'Consejo de Barrio' }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const iniciales = user?.nombre?.split(' ').map(p => p[0]).slice(0, 2).join('') ?? ''

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-surface shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-8 h-14 md:h-16">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú"
            onClick={onOpenDrawer}
            className="lg:hidden p-2 rounded-lg text-primary hover:bg-surface-container active:scale-95 transition-all"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-primary leading-tight">{title}</h1>
            <p className="text-xs text-on-surface-variant hidden sm:block">
              Barrio Cerro Moreno • Estaca La Portada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notificaciones"
            className="relative p-2 rounded-lg text-primary hover:bg-surface-container active:scale-95 transition-all"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="hidden md:flex items-center gap-2 pl-2 border-l border-outline-variant/30 hover:bg-surface-container rounded-lg pr-2 py-1"
            >
              <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-semibold text-sm">
                {iniciales}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-on-surface leading-tight">{user?.nombre}</span>
                <span className="text-xs text-secondary font-medium capitalize">
                  {user?.rol?.replace('_', ' ')}
                  {user?.organizaciones?.nombre && ` · ${user.organizaciones.nombre}`}
                </span>
              </div>
              <ChevronDown size={16} className={`text-on-surface-variant transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); navigate('/perfil') }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container text-left"
                >
                  <User size={16} /> Mi perfil
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 text-left border-t border-outline-variant/20"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}