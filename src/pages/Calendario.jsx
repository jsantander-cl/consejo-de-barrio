import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useAsignaciones } from '../lib/AsignacionesContext.jsx'
import AgendarReunionCalendarioModal from '../components/modals/AgendarReunionCalendarioModal.jsx'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function Calendario() {
  const { asignaciones } = useAsignaciones()
  const [fechaActual, setFechaActual] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date().getDate())
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [modalReunionAbierto, setModalReunionAbierto] = useState(false)

  const anio = fechaActual.getFullYear()
  const mes = fechaActual.getMonth() // 0-indexed

  const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  // Cargar actividades desde Supabase
  const cargarActividades = async () => {
    setCargando(true)
    const primerDiaMes = new Date(anio, mes, 1).toISOString()
    const ultimoDiaMes = new Date(anio, mes + 1, 0, 23, 59, 59).toISOString()

    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .gte('fecha', primerDiaMes)
      .lte('fecha', ultimoDiaMes)
      .order('fecha', { ascending: true })

    if (!error && data) {
      setEventos(data)
    } else {
      setEventos([])
    }
    setCargando(false)
  }

  // Cargar actividades desde Supabase cuando cambie el mes o año
  useEffect(() => {
    cargarActividades()
  }, [anio, mes])

  // Navegación de meses
  const mesAnterior = () => {
    setFechaActual(new Date(anio, mes - 1, 1))
    setDiaSeleccionado(1)
  }

  const mesSiguiente = () => {
    setFechaActual(new Date(anio, mes + 1, 1))
    setDiaSeleccionado(1)
  }

  // Generación de días del mes para la grilla
  const primerDiaSemana = new Date(anio, mes, 1).getDay()
  const totalDiasMes = new Date(anio, mes + 1, 0).getDate()

  const diasGrilla = []
  // Celdas vacías previas
  for (let i = 0; i < primerDiaSemana; i++) {
    diasGrilla.push(null)
  }
  // Días del mes
  for (let d = 1; d <= totalDiasMes; d++) {
    diasGrilla.push(d)
  }

  // Obtener eventos y vencimientos del día seleccionado
  const fechaSeleccionadaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`

  const eventosDelDia = eventos.filter((e) => {
    if (!e.fecha) return false
    return e.fecha.startsWith(fechaSeleccionadaStr)
  })

  const vencimientosDelDia = (asignaciones || []).filter((a) => a.fecha_limite === fechaSeleccionadaStr)

  // Función para determinar si un día específico tiene eventos o tareas
  const obtenerIndicadoresDia = (dia) => {
    if (!dia) return { tieneReunion: false, tieneActividad: false, tieneCompromiso: false }

    const fechaDiaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    
    const evs = eventos.filter((e) => e.fecha && e.fecha.startsWith(fechaDiaStr))
    const vcs = (asignaciones || []).filter((a) => a.fecha_limite === fechaDiaStr)

    const tieneReunion = evs.some((e) => {
      const txt = ((e.nombre || e.titulo || '') + ' ' + (e.tipo || '')).toLowerCase()
      return txt.includes('reunion') || txt.includes('reunión')
    })
    const tieneActividad = evs.some((e) => {
      const txt = ((e.nombre || e.titulo || '') + ' ' + (e.tipo || '')).toLowerCase()
      return !txt.includes('reunion') && !txt.includes('reunión')
    })
    const tieneCompromiso = vcs.length > 0

    return { tieneReunion, tieneActividad, tieneCompromiso }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con Botón de Nueva Reunión */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Calendario General de Ministración y Consejo</h1>
          <p className="text-sm text-on-surface-variant">
            Sincronización unificada de sesiones presidenciales, deberes de templo y convenios del barrio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalReunionAbierto(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl shadow-xs hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={18} />
          <span>Nueva Reunión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vista Calendario Mensual */}
        <Card className="lg:col-span-7">
          <div className="space-y-4">
            {/* Controles de Mes */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary capitalize">{nombreMes}</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={mesAnterior}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container transition-colors text-primary"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={mesSiguiente}
                  className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container transition-colors text-primary"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Encabezado Días de la semana */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-on-surface-variant py-2">
              {DIAS_SEMANA.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Grilla de Días */}
            <div className="grid grid-cols-7 gap-1">
              {diasGrilla.map((d, index) => {
                if (d === null) {
                  return <div key={`empty-${index}`} className="h-10 sm:h-12" />
                }

                const esSeleccionado = d === diaSeleccionado
                const { tieneReunion, tieneActividad, tieneCompromiso } = obtenerIndicadoresDia(d)

                return (
                  <button
                    key={`dia-${d}`}
                    type="button"
                    onClick={() => setDiaSeleccionado(d)}
                    className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all text-sm font-medium ${
                      esSeleccionado
                        ? 'bg-primary text-white shadow-md font-bold'
                        : 'hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>{d}</span>

                    {/* Puntos Indicadores de Eventos */}
                    <div className="flex items-center gap-1 mt-0.5">
                      {tieneReunion && (
                        <span className={`w-1.5 h-1.5 rounded-full ${esSeleccionado ? 'bg-white' : 'bg-primary'}`} />
                      )}
                      {tieneActividad && (
                        <span className={`w-1.5 h-1.5 rounded-full ${esSeleccionado ? 'bg-emerald-300' : 'bg-emerald-600'}`} />
                      )}
                      {tieneCompromiso && (
                        <span className={`w-1.5 h-1.5 rounded-full ${esSeleccionado ? 'bg-rose-300' : 'bg-rose-600'}`} />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Leyenda de Colores */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Reunión</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Actividad</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Compromiso / Vencimiento</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Panel Lateral: Agenda del Día */}
        <Card title={`Agenda del día ${diaSeleccionado}`} className="lg:col-span-5">
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              {eventosDelDia.length + vencimientosDelDia.length} eventos / tareas programadas
            </p>

            {cargando && <p className="text-xs text-on-surface-variant">Cargando eventos...</p>}

            {!cargando && eventosDelDia.length === 0 && vencimientosDelDia.length === 0 && (
              <div className="p-6 text-center text-on-surface-variant text-sm border border-dashed border-outline-variant/40 rounded-2xl">
                No hay actividades ni compromisos agendados para este día.
              </div>
            )}

            {/* Eventos desde Supabase */}
            {eventosDelDia.map((ev) => {
              const horaTexto = ev.fecha ? new Date(ev.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Hora por definir'
              const tituloMostrar = ev.nombre || ev.titulo || 'Sin título'
              const txtBusqueda = (tituloMostrar + ' ' + (ev.tipo || '')).toLowerCase()
              const esReunion = txtBusqueda.includes('reunion') || txtBusqueda.includes('reunión')

              return (
                <div key={ev.id} className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                      <Clock size={14} />
                      <span>{horaTexto}</span>
                    </div>
                    <StatusBadge status={esReunion ? 'info' : 'success'}>
                      {esReunion ? 'Reunión' : 'Actividad'}
                    </StatusBadge>
                  </div>
                  <h4 className="font-semibold text-primary text-sm leading-snug">{tituloMostrar}</h4>
                  {ev.lugar && (
                    <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <MapPin size={12} />
                      <span>{ev.lugar}</span>
                    </div>
                  )}
                  {ev.descripcion && (
                    <p className="text-[11px] text-on-surface-variant/80 pt-1 border-t border-outline-variant/10">
                      {ev.descripcion}
                    </p>
                  )}
                </div>
              )
            })}

            {/* Compromisos que vencen este día */}
            {vencimientosDelDia.map((v) => {
              const tituloLimpio = v.descripcion ? v.descripcion.split(' --- ')[0] : ''

              return (
                <div key={v.id} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Vencimiento</span>
                    <StatusBadge status="danger">Compromiso</StatusBadge>
                  </div>
                  <h4 className="font-semibold text-primary text-sm leading-snug">{tituloLimpio}</h4>
                  <p className="text-xs text-on-surface-variant">
                    Responsable: {v.usuarios?.nombre || 'Sin asignar'}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Ventana Emergente para Agendar Nueva Reunión */}
      <AgendarReunionCalendarioModal
        open={modalReunionAbierto}
        onClose={() => setModalReunionAbierto(false)}
        onCreado={cargarActividades}
      />
    </div>
  )
}