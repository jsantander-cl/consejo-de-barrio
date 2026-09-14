import { useEffect, useState } from 'react'
import { Plus, Calendar, MapPin } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import NuevaActividadModal from '../components/modals/NuevaActividadModal.jsx'

const ESTADO_BADGE = { propuesta: 'neutral', en_planificacion: 'warning', aprobada: 'success', realizada: 'info', cancelada: 'danger' }
const ESTADO_LABEL = { propuesta: 'Propuesta', en_planificacion: 'En planificación', aprobada: 'Aprobada', realizada: 'Realizada', cancelada: 'Cancelada' }

export default function Actividades() {
  const [actividades, setActividades] = useState([])
  const [organizaciones, setOrganizaciones] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    const [{ data: acts }, { data: orgs }] = await Promise.all([
      supabase.from('actividades').select('id, nombre, fecha, lugar, estado, organizaciones ( nombre )').order('fecha'),
      supabase.from('organizaciones').select('id, nombre').order('nombre'),
    ])
    setActividades(acts ?? [])
    setOrganizaciones(orgs ?? [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5"><Calendar size={14} /> CALENDARIO DE BARRIO</span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Planificación y Coordinación</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-lg shadow-sm"
        >
          <Plus size={20} /> Proponer actividad
        </button>
      </div>

      {cargando && <p className="text-sm text-on-surface-variant">Cargando actividades...</p>}
      {!cargando && actividades.length === 0 && <p className="text-sm text-on-surface-variant">Aún no hay actividades propuestas.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {actividades.map((a) => (
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
            <h3 className="text-lg font-bold text-primary mt-2">{a.nombre}</h3>
            {a.lugar && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mt-3 pt-3 border-t border-outline-variant/20">
                <MapPin size={16} className="text-outline" />
                <span>{a.lugar}</span>
              </div>
            )}
          </Card>
        ))}
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