import { useEffect, useState } from 'react'
import { UserPlus, Check, Circle, Clock, Pencil, Trash2 } from 'lucide-react'
import { StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import NuevoMiembroModal from '../components/modals/NuevoMiembroModal.jsx'
import EditarHitoModal from '../components/modals/EditarHitoModal.jsx'

const TIPO_LABEL = { nuevo_converso: 'Nuevo Converso', reactivado: 'Reactivado / Amigo' }

function IconoHito({ estado }) {
  if (estado === 'completado') return <Check size={14} />
  if (estado === 'en_curso') return <Clock size={14} />
  return <Circle size={12} />
}

export default function SendaConvenios() {
  const [miembros, setMiembros] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [hitoSeleccionado, setHitoSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
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
            .sort((a, b) => a.checklist_senda_convenios.orden - b.checklist_senda_convenios.orden)
          const completados = hitos.filter((h) => h.estado === 'completado').length

          return (
            <article key={m.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 bg-surface-container-low/40 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                    {m.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-primary">{m.nombre}</h3>
                      <StatusBadge status="info">{TIPO_LABEL[m.tipo]}</StatusBadge>
                    </div>
                    {m.ministrantes && (
                      <p className="text-sm text-on-surface-variant mt-1">
                        Ministrante(s): <strong className="text-on-surface font-medium">{m.ministrantes}</strong>
                      </p>
                    )}
                    {m.creador?.nombre && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Agregado por: <strong className="text-on-surface font-medium">{m.creador.nombre}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-outline-variant/20">
                  <div className="text-left md:text-right">
                    <span className="text-xs uppercase text-on-surface-variant block">Progreso de la senda</span>
                    <span className="text-lg font-bold text-secondary">{completados} de {hitos.length} hitos</span>
                  </div>

                  <div className="flex items-center gap-1 bg-surface-container/60 p-1 rounded-lg border border-outline-variant/30">
                    <button
                      onClick={() => alert(`Editar información de ${m.nombre}`)}
                      title="Editar miembro"
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-md transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => eliminarMiembro(m.id, m.nombre)}
                      title="Eliminar miembro"
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 overflow-x-auto">
                <div className="min-w-[640px] flex items-start justify-between relative py-2">
                  <div className="absolute left-12 right-12 top-[23px] h-0.5 bg-outline-variant/30 z-0" />
                  {hitos.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHitoSeleccionado({ ...h, nombreHito: h.checklist_senda_convenios.nombre_hito })}
                      className="flex flex-col items-center text-center relative z-10 w-24 group focus:outline-none"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                          h.estado === 'completado'
                            ? 'bg-secondary text-on-secondary'
                            : h.estado === 'en_curso'
                            ? 'bg-status-warning-bg text-status-warning-text border-2 border-status-warning-text'
                            : 'bg-surface-container text-outline border border-outline-variant'
                        }`}
                      >
                        <IconoHito estado={h.estado} />
                      </div>
                      <span className="mt-2 text-xs font-medium text-primary leading-tight">{h.checklist_senda_convenios.nombre_hito}</span>
                      {h.notas && <span className="mt-1 text-[10px] text-on-surface-variant italic line-clamp-1">"{h.notas}"</span>}
                    </button>
                  ))}
                </div>
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