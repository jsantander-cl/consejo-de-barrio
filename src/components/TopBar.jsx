import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, CheckCheck, Clock, Inbox } from 'lucide-react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function TopBar({ onOpenDrawer, title = 'Consejo de Barrio' }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  const iniciales = user?.nombre?.split(' ').map(p => p[0]).slice(0, 2).join('') ?? ''

  // Cargar notificaciones desde Supabase
  const cargarNotificaciones = async () => {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setNotificaciones(data)
    }
  }

  useEffect(() => {
    cargarNotificaciones()

    // Opcional: Suscripción en tiempo real para nuevas notificaciones
    const channel = supabase
      .channel('public:notificaciones')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, (payload) => {
        setNotificaciones((prev) => [payload.new, ...prev])
      })
      .subscribe()

    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      supabase.removeChannel(channel)
    }
  }, [])

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    const idsNoLeidas = notificaciones.filter(n => !n.leida).map(n => n.id)
    if (idsNoLeidas.length === 0) return

    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .in('id', idsNoLeidas)

    if (!error) {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    }
  }

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/login')
  }

  const tieneNoLeidas = notificaciones.some(n => !n.leida)

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
          
          {/* ----------------------------------------- */}
          {/* BOTÓN Y MENÚ DESPLEGABLE DE NOTIFICACIONES */}
          {/* ----------------------------------------- */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Notificaciones"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2 rounded-lg text-primary hover:bg-surface-container active:scale-95 transition-all"
            >
              <Bell size={20} />
              {tieneNoLeidas && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-primary" />
                    <span className="text-sm font-bold text-primary">Notificaciones</span>
                  </div>
                  {tieneNoLeidas && (
                    <button
                      onClick={marcarTodasLeidas}
                      className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={14} /> Marcar leídas
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto divide-y divide-outline-variant/15">
                  {notificaciones.length === 0 ? (
                    <div className="py-8 text-center space-y-2 text-on-surface-variant">
                      <Inbox size={28} className="mx-auto opacity-40" />
                      <p className="text-xs italic">No hay notificaciones recientes</p>
                    </div>
                  ) : (
                    notificaciones.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3.5 transition-colors flex items-start gap-3 ${!n.leida ? 'bg-primary/5' : 'hover:bg-surface-container-low/50'}`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.leida ? 'bg-error' : 'bg-transparent'}`} />
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs font-bold text-primary">{n.titulo}</p>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{n.descripcion}</p>
                          <span className="text-[10px] text-outline flex items-center gap-1 pt-1">
                            <Clock size={10} /> {new Date(n.created_at).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------- */}
          {/* PERFIL Y MENÚ DE USUARIO                   */}
          {/* ----------------------------------------- */}
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
              <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden">
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