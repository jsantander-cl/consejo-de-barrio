import { Link } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, UserSearch, CalendarDays, Lock, ArrowRight } from 'lucide-react'
import { KpiCard, Card, StatusBadge } from '../components/ui.jsx'
import { useState, useEffect } from 'react'
import { useAsignaciones } from '../lib/AsignacionesContext.jsx'
import ReasignarModal from '../components/modals/ReasignarModal.jsx'
import DetalleAsignacionModal from '../components/modals/DetalleAsignacionModal.jsx'
import { supabase } from '../lib/supabaseClient.js'

export default function Dashboard() {
  const { asignaciones, vencidas } = useAsignaciones()
  const [asignacionAReasignar, setAsignacionAReasignar] = useState(null)
  const [tareaDetalle, setTareaDetalle] = useState(null)
  
  // Estados para métricas dinámicas
  const [miembrosSeguimientoCount, setMiembrosSeguimientoCount] = useState(0)
  const [proximaReunion, setProximaReunion] = useState(null)
  const [proximasActividades, setProximasActividades] = useState([])
  const [compromisosOrg, setCompromisosOrg] = useState([])
  const [senda, setSenda] = useState([])

  useEffect(() => {
    async function cargarDatosDashboard() {
      // 1. Total de miembros en seguimiento
      const { data: miembrosData, count: totalMiembros } = await supabase
        .from('miembros_seguimiento')
        .select('*, miembro_checklist_progreso ( estado, aplica )', { count: 'exact' })
        .eq('activo', true)
      
      const totalSenda = totalMiembros || miembrosData?.length || 0
      setMiembrosSeguimientoCount(totalSenda)

      // 2. Próxima Reunión General (Domingos de cada mes)
      const hoy = new Date()
      const hoyIso = hoy.toISOString()
      
      const { data: eventosData } = await supabase
        .from('actividades')
        .select('*')
        .gte('fecha', hoyIso)
        .order('fecha', { ascending: true })

      let reunionDomingo = null

      if (eventosData && eventosData.length > 0) {
        setProximasActividades(eventosData.slice(0, 3))

        // Buscar en la BD eventos agendados específicamente para un domingo
        reunionDomingo = eventosData.find(e => {
          const f = new Date(e.fecha)
          return f.getDay() === 0 || (e.titulo || '').toLowerCase().includes('domingo')
        })
      } else {
        setProximasActividades([])
      }

      if (reunionDomingo) {
        const fechaObj = new Date(reunionDomingo.fecha)
        const dia = fechaObj.getDate()
        const mes = fechaObj.toLocaleDateString('es-ES', { month: 'short' })
        setProximaReunion({
          fechaTexto: `${dia} ${mes}`,
          titulo: reunionDomingo.titulo || 'Consejo de Barrio'
        })
      } else {
        // Si no hay evento explícito en BD, calcular matemáticamente el próximo domingo
        const proximoDomingo = new Date()
        const diasHastaDomingo = (7 - hoy.getDay()) % 7 || 7
        proximoDomingo.setDate(hoy.getDate() + diasHastaDomingo)
        
        const dia = proximoDomingo.getDate()
        const mes = proximoDomingo.toLocaleDateString('es-ES', { month: 'short' })
        setProximaReunion({
          fechaTexto: `${dia} ${mes}`,
          titulo: 'Consejo de Barrio'
        })
      }

      // 3. Progreso Senda de Convenios basado en Hitos Reales
      const buckets = { contacto: 0, avance: 0, ordenanzas: 0, completado: 0 }

      if (miembrosData && miembrosData.length > 0) {
        miembrosData.forEach((m) => {
          const checklist = m.miembro_checklist_progreso || []
          const hitosAplica = checklist.filter(h => h.aplica)
          const hitosCompletados = checklist.filter(h => h.estado === 'completado' || h.estado === 'cumplido').length
          
          // Clasificación según cantidad de hitos completados
          if (hitosCompletados <= 2) {
            buckets.contacto++
          } else if (hitosCompletados <= 4) {
            buckets.avance++
          } else if (hitosCompletados <= 6) {
            buckets.ordenanzas++
          } else {
            buckets.completado++
          }
        })
      }

      const divisor = totalSenda > 0 ? totalSenda : 1
      setSenda([
        { 
          label: 'Contacto e Inicio (1-2 hitos)', 
          count: buckets.contacto, 
          pct: totalSenda > 0 ? Math.round((buckets.contacto / divisor) * 100) : 0, 
          color: 'bg-primary-fixed-dim' 
        },
        { 
          label: 'Acompañamiento (3-4 hitos)', 
          count: buckets.avance, 
          pct: totalSenda > 0 ? Math.round((buckets.avance / divisor) * 100) : 0, 
          color: 'bg-secondary' 
        },
        { 
          label: 'Preparando Ordenanzas (5-6 hitos)', 
          count: buckets.ordenanzas, 
          pct: totalSenda > 0 ? Math.round((buckets.ordenanzas / divisor) * 100) : 0, 
          color: 'bg-secondary-container' 
        },
        { 
          label: 'Convenios Completados (7 hitos)', 
          count: buckets.completado, 
          pct: totalSenda > 0 ? Math.round((buckets.completado / divisor) * 100) : 0, 
          color: 'bg-tertiary-container' 
        },
      ])

      // 4. Compromisos por Organización
      const { data: orgsData } = await supabase.from('organizaciones').select('id, nombre')
      const fechaHoy = new Date().toISOString().split('T')[0]
      
      if (orgsData && asignaciones) {
        const desglose = orgsData
          .map((org) => {
            const nombreNormalizado = org.nombre.trim().toLowerCase()

            const tareasOrg = asignaciones.filter((a) => {
              const orgIdCoincide =
                a.organizacion_id === org.id ||
                a.organizaciones?.id === org.id ||
                a.usuarios?.organizacion_id === org.id ||
                a.usuarios?.organizaciones?.id === org.id

              const nombreDirecto = a.organizacion || a.organizaciones?.nombre || a.usuarios?.organizaciones?.nombre || ''
              const orgNombreCoincide = nombreDirecto.trim().toLowerCase() === nombreNormalizado

              return orgIdCoincide || orgNombreCoincide
            })

            const total = tareasOrg.length
            if (total === 0) return null

            let cumplidas = 0
            let enProceso = 0
            let pendientes = 0
            let vencidasOrg = 0

            tareasOrg.forEach((a) => {
              const st = (a.estado || '').toLowerCase()
              const estaVencidaPorFecha = a.fecha_limite && a.fecha_limite < fechaHoy && st !== 'completado' && st !== 'cumplido'

              if (st === 'completado' || st === 'cumplido') {
                cumplidas++
              } else if (st === 'vencida' || st === 'vencido' || estaVencidaPorFecha) {
                vencidasOrg++
              } else if (st === 'en_proceso' || st === 'en proceso') {
                enProceso++
              } else {
                pendientes++
              }
            })

            return {
              org: org.nombre,
              total,
              cumplido: Math.round((cumplidas / total) * 100),
              proceso: Math.round((enProceso / total) * 100),
              pendiente: Math.round((pendientes / total) * 100),
              vencida: Math.round((vencidasOrg / total) * 100)
            }
          })
          .filter(Boolean)

        setCompromisosOrg(desglose)
      }
    }

    cargarDatosDashboard()
  }, [asignaciones])

  // Métricas para tarjetas KPI superiores
  const pendientesCount = asignaciones ? asignaciones.filter(a => a.estado !== 'completado' && a.estado !== 'cumplido').length : 0
  const vencidasCount = vencidas ? vencidas.length : 0

  const KPIS_DINAMICOS = [
    { 
      icon: CheckCircle2, 
      label: 'Compromisos pendientes', 
      value: pendientesCount, 
      hint: `${pendientesCount} activos en total` 
    },
    { 
      icon: AlertTriangle, 
      label: 'Compromisos vencidos', 
      value: vencidasCount, 
      hint: vencidasCount > 0 ? 'Requieren atención inmediata' : 'Al día', 
      danger: vencidasCount > 0 
    },
    { 
      icon: UserSearch, 
      label: 'Miembros en seguimiento', 
      value: miembrosSeguimientoCount, 
      hint: 'En la senda de convenios' 
    },
    { 
      icon: CalendarDays, 
      label: 'Próxima reunión general', 
      value: proximaReunion?.fechaTexto || 'Cargando...', 
      hint: proximaReunion?.titulo || 'Consejo de Barrio' 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">3er Trimestre 2026</span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mt-1">Tablero del Consejo</h1>
          <p className="text-sm text-on-surface-variant">Coordinación y estado de deliberación del Barrio Cerro Moreno.</p>
        </div>
      </div>

      {/* Tarjeta de acceso reservado */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary uppercase font-bold tracking-wider">Acceso reservado · Obispado</span>
                <StatusBadge status="info">Confidencial</StatusBadge>
              </div>
              <h2 className="text-base font-semibold text-on-surface mt-0.5">
                Próxima reunión de obispado: {proximaReunion?.fechaTexto || 'Por agendar'}
              </h2>
            </div>
          </div>
          <Link
            to="/reuniones/obispado"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-container bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/40 shadow-xs shrink-0"
          >
            Ver agenda confidencial <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      {/* 4 Tarjetas KPI Dinámicas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS_DINAMICOS.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compromisos por Organización */}
        <Card
          title="Compromisos por organización"
          subtitle="Balance de cumplimiento asignado en el consejo"
          className="lg:col-span-7"
        >
          <div className="space-y-4">
            {compromisosOrg.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No hay organizaciones con tareas activas registradas.</p>
            ) : (
              compromisosOrg.map((o) => (
                <div key={o.org} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-on-surface">{o.org}</span>
                    <span className="text-xs text-on-surface-variant">{o.total} tareas · {o.cumplido}% cumplido</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden flex">
                    <div className="bg-rose-800 h-full" style={{ width: `${o.vencida}%` }} />
                    <div className="bg-gray-600 h-full" style={{ width: `${o.pendiente}%` }} />
                    <div className="bg-yellow-400 h-full" style={{ width: `${o.proceso}%` }} />
                    <div className="bg-emerald-800 h-full" style={{ width: `${o.cumplido}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Progreso senda de convenios basado en Hitos Reales */}
        <Card
          title="Progreso senda de convenios"
          subtitle="Distribución de miembros en acompañamiento"
          action={
            <Link to="/senda-convenios" className="text-xs text-primary font-semibold hover:underline">
              Ver seguimiento
            </Link>
          }
          className="lg:col-span-5"
        >
          <div className="flex flex-col gap-3">
            {senda.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${s.color}`} />
                  <span className="text-on-surface font-medium">{s.label}</span>
                </div>
                <span className="font-bold text-primary">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarjeta Próximas Actividades Dinámica */}
        <Card 
          title="Próximas actividades" 
          action={<Link to="/calendario" className="text-xs text-primary font-semibold hover:underline">Ver calendario</Link>}
        >
          <div className="space-y-2">
            {proximasActividades.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No hay actividades agendadas próximamente.</p>
            ) : (
              proximasActividades.map((a) => {
                const fechaObj = new Date(a.fecha)
                const diaNombre = fechaObj.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '')
                const diaNum = fechaObj.getDate()
                const horaTexto = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

                return (
                  <div key={a.id} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest/70 flex flex-col items-center justify-center shrink-0 text-primary">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant">{diaNombre}</span>
                      <span className="text-lg font-bold leading-tight">{diaNum}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-secondary block">{a.organizacion || 'Barrio'}</span>
                      <h4 className="text-sm font-semibold text-primary truncate">{a.titulo}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {horaTexto} hrs {a.lugar ? `· ${a.lugar}` : ''}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        {/* Asignaciones Vencidas Críticas */}
        <Card
          title="Asignaciones vencidas críticas"
          action={<StatusBadge status="danger">{vencidas.length} pendientes</StatusBadge>}
        >
          <div className="space-y-3">
            {vencidas.length === 0 && (
              <p className="text-sm text-on-surface-variant">No hay asignaciones vencidas. 🎉</p>
            )}
            {vencidas.map((v) => {
              const tituloLimpio = v.descripcion ? v.descripcion.split(' --- ')[0] : ''

              return (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-outline-variant/15 first:border-0 first:pt-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-primary">{tituloLimpio}</h4>
                      <StatusBadge status="danger">Vence: {v.fecha_limite}</StatusBadge>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {v.usuarios?.nombre} {v.usuarios?.organizaciones?.nombre ? `· ${v.usuarios.organizaciones.nombre}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => setTareaDetalle(v)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-medium text-primary transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => setAsignacionAReasignar(v)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-medium text-on-surface transition-colors"
                    >
                      Reasignar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      <ReasignarModal
        asignacion={asignacionAReasignar}
        onClose={() => setAsignacionAReasignar(null)}
      />

      <DetalleAsignacionModal
        open={Boolean(tareaDetalle)}
        onClose={() => setTareaDetalle(null)}
        asignacion={tareaDetalle}
      />
    </div>
  )
}