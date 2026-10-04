import { useEffect, useState } from 'react'
import { Plus, Calendar, MapPin, CheckCircle, XCircle, Edit3, Save, X } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import NuevaActividadModal from '../components/modals/NuevaActividadModal.jsx'

const ESTADO_BADGE = { propuesta: 'neutral', en_planificacion: 'warning', aprobada: 'success', realizada: 'info', cancelada: 'danger' }
const ESTADO_LABEL = { propuesta: 'Propuesta', en_planificacion: 'En planificación', aprobada: 'Aprobada', realizada: 'Realizada', cancelada: 'Rechazada / Cancelada' }

export default function Actividades() {
  const { user } = useAuth()
  const [actividades, setActividades] = useState([])
  const [organizaciones, setOrganizaciones] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Estado para editar una actividad (en caso de rechazo o ajuste)
  const [editandoId, setEditandoId] = useState(null)
  const [formEdicion, setFormEdicion] = useState({ nombre: '', fecha: '', lugar: '' })

  // Verificamos si el rol del usuario actual es de Obispado o Secretaría
  const rolUsuario = user?.rol?.toLowerCase() || ''
  const esObispadoOSecretaria = ['obispo', 'consejero', 'sec_ejecutivo', 'sec_barrio'].includes(rolUsuario)

  async function cargar() {
    setCargando(true)
    const [{ data: acts, error: errActs }, { data: orgs }] = await Promise.all([
      supabase.from('actividades').select('id, nombre, fecha, lugar, estado, organizaciones ( nombre )').order('created_at', { ascending: false }),
      supabase.from('organizaciones').select('id, nombre').order('nombre'),
    ])

    if (errActs) console.error('Error cargando actividades:', errActs.message)

    setActividades(acts ?? [])
    setOrganizaciones(orgs ?? [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  // Cambiar estado de la actividad (Aprobar / Rechazar)
  async function cambiarEstado(id, nuevoEstado) {
    console.log(`Intentando cambiar actividad ${id} a estado: ${nuevoEstado}`)

    const { data, error } = await supabase
      .from('actividades')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error de Supabase al actualizar:', error.message)
      alert('Error al actualizar el estado en la base de datos: ' + error.message)
      return
    }

    console.log('Actividad actualizada con éxito:', data)
    cargar()
  }

  // Guardar cambios de edición de una actividad rechazada
  async function guardarEdicion(id) {
    const { error } = await supabase
      .from('actividades')
      .update({
        nombre: formEdicion.nombre,
        fecha: formEdicion.fecha,
        lugar: formEdicion.lugar,
        estado: 'propuesta' // Al editar se re-propone automáticamente
      })
      .eq('id', id)

    if (error) {
      alert('Error al guardar cambios: ' + error.message)
      return
    }
    setEditandoId(null)
    cargar()
  }

  function iniciarEdicion(a) {
    setEditandoId(a.id)
    setFormEdicion({ nombre: a.nombre, fecha: a.fecha, lugar: a.lugar || '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5"><Calendar size={14} /> CALENDARIO DE BARRIO</span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Planificación y Coordinación</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Plus size={20} /> Proponer actividad
        </button>
      </div>

      {cargando && <p className="text-sm text-on-surface-variant">Cargando actividades...</p>}
      {!cargando && actividades.length === 0 && <p className="text-sm text-on-surface-variant">Aún no hay actividades propuestas.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {actividades.map((a) => {
          const estaEditando = editandoId === a.id

          return (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-1 rounded-lg text-sm">
                  <Calendar size={16} className="text-primary" />
                  <span className="font-medium text-primary">{a.fecha}</span>
                </div>
                <StatusBadge status={ESTADO_BADGE[a.estado]}>{ESTADO_LABEL[a.estado]}</StatusBadge>
              </div>

              {a.organizaciones?.nombre && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-secondary-container/60 text-on-secondary-container font-semibold">
                  {a.organizaciones.nombre}
                </span>
              )}

              {/* MODO EDICIÓN SI FUE RECHAZADA */}
              {estaEditando ? (
                <div className="space-y-3 mt-3 pt-3 border-t border-outline-variant/20">
                  <input
                    type="text"
                    value={formEdicion.nombre}
                    onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-white"
                    placeholder="Nombre de la actividad"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formEdicion.fecha}
                      onChange={(e) => setFormEdicion({ ...formEdicion, fecha: e.target.value })}
                      className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-white"
                    />
                    <input
                      type="text"
                      value={formEdicion.lugar}
                      onChange={(e) => setFormEdicion({ ...formEdicion, lugar: e.target.value })}
                      className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-white"
                      placeholder="Lugar"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditandoId(null)}
                      className="px-3 py-1 text-xs bg-surface-container text-on-surface rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => guardarEdicion(a.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-white rounded-lg font-medium"
                    >
                      <Save size={14} /> Guardar y Re-proponer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-primary mt-2">{a.nombre}</h3>
                  {a.lugar && (
                    <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mt-3 pt-3 border-t border-outline-variant/20">
                      <MapPin size={16} className="text-outline" />
                      <span>{a.lugar}</span>
                    </div>
                  )}
                </>
              )}

              {/* ACCIONES DE APROBACIÓN PARA OBISPADO / SECRETARIOS */}
              {esObispadoOSecretaria && a.estado === 'propuesta' && !estaEditando && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => cambiarEstado(a.id, 'cancelada')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-error-container text-on-error-container font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarEstado(a.id, 'aprobada')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <CheckCircle size={16} /> Aprobar
                  </button>
                </div>
              )}

              {/* BOTÓN DE EDITAR SI ESTÁ RECHAZADA / CANCELADA */}
              {a.estado === 'cancelada' && !estaEditando && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
                  <span className="text-xs text-error font-medium">Actividad rechazada. Puedes cambiar la fecha y re-proponerla.</span>
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(a)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-surface-container text-primary font-semibold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} /> Editar y Corregir
                  </button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <NuevaActividadModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        organizaciones={organizaciones}
        onCreada={cargar}
      />
    </div>
  )
}