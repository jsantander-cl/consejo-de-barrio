import { useEffect, useState } from 'react'
import { UserPlus, Check, Clock, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import NuevoMiembroModal from '../components/modals/NuevoMiembroModal.jsx'
import EditarHitoModal from '../components/modals/EditarHitoModal.jsx'

const TIPO_LABEL = { nuevo_converso: 'Nuevo Converso', reactivado: 'Reactivado / Amigo' }

// Renderiza el ícono según el estado o el número si está pendiente
function ContenidoCirculoHito({ estado, numero }) {
  if (estado === 'completado') return <Check size={18} strokeWidth={2.5} />
  if (estado === 'en_curso') return <Clock size={18} strokeWidth={2.2} />
  return <span className="text-sm font-bold tracking-tight">{numero}</span>
}

export default function SendaConvenios() {
  const [miembros, setMiembros] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [hitoSeleccionado, setHitoSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [expandidos, setExpandidos] = useState({})

  async function cargar() {
    setCargando(true)
    const { data } = await supabase
      .from('miembros_seguimiento')
      .select(`
        id, nombre, tipo, ministrantes,
        creador:usuarios!miembros_seguimiento_creado_por_fkey ( nombre ),
        miembro_checklist_progreso (
          id, estado, notas, aplica,
          checklist_senda_convenios ( nombre_hito, orden )
        )
      `)
      .eq('activo', true)
      .order('nombre')
    setMiembros(data ?? [])
    setCargando(false)
  }

  async function eliminarMiembro(id, nombre) {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre} del seguimiento?`)
    if (!confirmar) return

    const { error } = await supabase
      .from('miembros_seguimiento')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      alert('Error al eliminar el miembro: ' + error.message)
      return
    }

    cargar()
  }

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => { cargar() }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Senda de Convenios</h1>
          <p className="text-sm text-on-surface-variant">{miembros.length} miembros en progreso ministerial</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          <UserPlus size={18} /> Agregar miembro a seguimiento
        </button>
      </div>

      {cargando && <p className="text-sm text-on-surface-variant">Cargando miembros...</p>}
      {!cargando && miembros.length === 0 && <p className="text-sm text-on-surface-variant">Aún no hay miembros en seguimiento.</p>}

      <div className="space-y-4">
        {miembros.map((m) => {
          const hitos = (m.miembro_checklist_progreso ?? [])
            .filter((h) => h.aplica)
            .sort((a, b) => (a.checklist_senda_convenios?.orden || 0) - (b.checklist_senda_convenios?.orden || 0))
          const completados = hitos.filter((h) => h.estado === 'completado').length
          const estaExpandido = !!expandidos[m.id]

          return (
            <article key={m.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden transition-all duration-300">
              {/* Encabezado del miembro */}
              <div className="p-4 md:p-6 bg-surface-container-low/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    {m.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-primary text-lg leading-snug">{m.nombre}</h3>
                      <StatusBadge status="info">{TIPO_LABEL[m.tipo] || m.tipo}</StatusBadge>
                    </div>
                    {m.ministrantes && (
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Ministrante(s): <strong className="text-on-surface font-medium">{m.ministrantes}</strong>
                      </p>
                    )}
                    {m.creador?.nombre && (
                      <p className="text-xs text-on-surface-variant/80 mt-0.5">
                        Agregado por: <strong className="text-on-surface font-medium">{m.creador.nombre}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/20">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase block">Progreso de la Senda</span>
                    <span className="text-xl font-bold text-emerald-800">{completados} de {hitos.length} hitos</span>
                  </div>

                  <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
                    <button
                      onClick={() => alert(`Editar información de ${m.nombre}`)}
                      title="Editar miembro"
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => eliminarMiembro(m.id, m.nombre)}
                      title="Eliminar miembro"
                      className="p-1.5 text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Vista Desplegada: Línea horizontal con números para pendientes e íconos para completado/en curso */}
              {estaExpandido && (
                <div className="p-6 md:p-10 border-t border-outline-variant/20 bg-white overflow-x-auto">
                  <div className="min-w-[800px] grid grid-cols-6 gap-y-12 gap-x-0 relative">
                    {hitos.map((h, index) => {
                      const numeroHito = h.checklist_senda_convenios?.orden || index + 1
                      const esFinDeFila = (index + 1) % 6 === 0
                      const esUltimoGlobal = index === hitos.length - 1

                      return (
                        <div key={h.id} className="relative flex flex-col items-center">
                          {/* Línea horizontal que conecta los círculos en la misma fila */}
                          {!esFinDeFila && !esUltimoGlobal && (
                            <div className="absolute left-[50%] right-[-50%] top-[20px] h-[2px] bg-outline-variant/40 z-0 pointer-events-none" />
                          )}

                          <button
                            onClick={() =>
                              setHitoSeleccionado({
                                ...h,
                                nombreHito: h.checklist_senda_convenios?.nombre_hito,
                              })
                            }
                            className="flex flex-col items-center text-center group focus:outline-none relative z-10 w-full px-2"
                          >
                            {/* Círculo que varía estilo e ícono/número según estado */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                                h.estado === 'completado'
                                  ? 'bg-emerald-700 text-white border-2 border-emerald-700'
                                  : h.estado === 'en_curso'
                                  ? 'bg-amber-100 text-amber-800 border-2 border-amber-600'
                                  : 'bg-white text-slate-600 border-2 border-outline-variant/80'
                              }`}
                            >
                              <ContenidoCirculoHito estado={h.estado} numero={numeroHito} />
                            </div>

                            <span className="mt-2 text-xs font-semibold text-primary leading-tight line-clamp-2">
                              {h.checklist_senda_convenios?.nombre_hito}
                            </span>

                            {h.notas && (
                              <span className="mt-1 text-[10px] text-on-surface-variant italic line-clamp-2 bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/20">
                                "{h.notas}"
                              </span>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Botón de Despliegue */}
              <div className="p-2.5 text-center bg-surface-container-low/30 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => toggleExpandir(m.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1 px-4 rounded-lg hover:bg-surface-container/50"
                >
                  {estaExpandido ? (
                    <>
                      <span>Ver menos</span>
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      <span>Ver más hitos ({hitos.length} adicionales)</span>
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <NuevoMiembroModal open={modalAbierto} onClose={() => setModalAbierto(false)} onCreado={cargar} />
      <EditarHitoModal hito={hitoSeleccionado} onClose={() => setHitoSeleccionado(null)} onGuardado={cargar} />
    </div>
  )
}