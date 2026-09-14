import { useEffect, useState } from 'react'
import { Mail, Building2, ShieldCheck, LogOut } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useAsignaciones } from '../lib/AsignacionesContext.jsx'

export default function Perfil() {
  const { asignaciones } = useAsignaciones()
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function obtenerDatosPerfil() {
      setCargando(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Consultar la tabla de usuarios registrados en el sistema del barrio
        const { data: perfilData } = await supabase
          .from('usuarios')
          .select('*, organizaciones ( nombre )')
          .eq('id', user.id)
          .single()

        setUsuario({
          id: user.id,
          email: user.email,
          nombre: perfilData?.nombre || user.user_metadata?.full_name || 'Jordan Santander',
          organizacion: perfilData?.organizaciones?.nombre || perfilData?.organizacion || 'Obispado',
          rol: perfilData?.rol || 'sec_barrio',
          created_at: user.created_at
        })
      }
      setCargando(false)
    }

    obtenerDatosPerfil()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // Filtrado flexible de asignaciones por ID o por Nombre del responsable
  const misTareas = (asignaciones || []).filter((a) => {
    if (!usuario) return false

    const idCoincide = a.usuario_id === usuario.id || a.usuarios?.id === usuario.id
    
    const nombreUsuarioNorm = (usuario.nombre || '').trim().toLowerCase()
    const nombreResponsableDirecto = (a.responsable || a.usuarios?.nombre || '').trim().toLowerCase()
    const nombreCoincide = nombreUsuarioNorm.length > 0 && nombreResponsableDirecto === nombreUsuarioNorm

    return idCoincide || nombreCoincide
  })

  const fechaHoy = new Date().toISOString().split('T')[0]
  
  let completadas = 0
  let enProceso = 0
  let pendientes = 0
  let vencidas = 0

  misTareas.forEach((a) => {
    const st = (a.estado || '').toLowerCase().trim()
    const estaVencidaPorFecha = a.fecha_limite && a.fecha_limite < fechaHoy && st !== 'completado' && st !== 'cumplido'

    if (st === 'completado' || st === 'cumplido') {
      completadas++
    } else if (st === 'vencida' || st === 'vencido' || estaVencidaPorFecha) {
      vencidas++
    } else if (st === 'en_proceso' || st === 'en proceso' || st === 'en_curso') {
      enProceso++
    } else {
      pendientes++
    }
  })

  if (cargando) {
    return <p className="text-sm text-on-surface-variant">Cargando perfil...</p>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-on-surface-variant">
          Información personal, rol en el consejo y resumen de compromisos asignados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tarjeta de Información del Usuario */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center shadow-md shrink-0">
                {usuario?.nombre ? usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JS'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">{usuario?.nombre}</h2>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusBadge status="info">{usuario?.organizacion}</StatusBadge>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-sm">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Mail size={18} className="text-primary shrink-0" />
                <span className="truncate text-on-surface">{usuario?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Building2 size={18} className="text-primary shrink-0" />
                <span className="text-on-surface">{usuario?.organizacion}</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <ShieldCheck size={18} className="text-primary shrink-0" />
                <span className="text-on-surface">Rol: <strong className="font-semibold">{usuario?.rol}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-outline-variant/30">
            <button
              onClick={cerrarSesion}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/80 font-medium text-sm transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </Card>

        {/* Resumen de Asignaciones Personales */}
        <Card title="Mis compromisos asignados" subtitle="Estado de tareas bajo tu responsabilidad" className="lg:col-span-7">
          <div className="space-y-6">
            {/* Métricas rápidas del usuario */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center">
                <span className="text-xs font-semibold text-emerald-800 block">Cumplidas</span>
                <span className="text-xl font-bold text-emerald-900">{completadas}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-center">
                <span className="text-xs font-semibold text-amber-800 block">En proceso</span>
                <span className="text-xl font-bold text-amber-900">{enProceso}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/60 text-center">
                <span className="text-xs font-semibold text-gray-700 block">Pendientes</span>
                <span className="text-xl font-bold text-gray-900">{pendientes}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-center">
                <span className="text-xs font-semibold text-rose-800 block">Vencidas</span>
                <span className="text-xl font-bold text-rose-900">{vencidas}</span>
              </div>
            </div>

            {/* Listado de compromisos */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Listado de tareas</h4>
              {misTareas.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No tienes tareas asignadas actualmente.</p>
              ) : (
                misTareas.map((a) => {
                  const tituloLimpio = a.descripcion ? a.descripcion.split(' --- ')[0] : ''
                  const st = (a.estado || '').toLowerCase().trim()
                  const estaVencida = a.fecha_limite && a.fecha_limite < fechaHoy && st !== 'completado' && st !== 'cumplido'

                  return (
                    <div key={a.id} className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-sm font-semibold text-primary">{tituloLimpio}</h5>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Fecha límite: {a.fecha_limite || 'Sin fecha'}
                        </p>
                      </div>
                      <StatusBadge status={st === 'completado' || st === 'cumplido' ? 'success' : estaVencida ? 'danger' : st === 'en_proceso' || st === 'en proceso' ? 'warning' : 'default'}>
                        {estaVencida ? 'Vencida' : a.estado || 'Pendiente'}
                      </StatusBadge>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}