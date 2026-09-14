import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, UserCheck, ListChecks } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'
import { supabase } from '../lib/supabaseClient.js'
import NuevaReunionModal from '../components/modals/NuevaReunionModal.jsx'

const TIPOS = ['Todas', 'consejo_barrio', 'obispado']
const ETIQUETAS = { consejo_barrio: 'Consejo de Barrio', obispado: 'Obispado' }

export default function Reuniones() {
  const [reuniones, setReuniones] = useState([])
  const [filtro, setFiltro] = useState('Todas')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    const { data } = await supabase
      .from('reuniones')
      .select('id, fecha, tipo, estado, usuarios ( nombre )')
      .order('fecha', { ascending: false })
    setReuniones(data ?? [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const visibles = reuniones.filter((r) => filtro === 'Todas' || r.tipo === filtro)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Deliberación & Mayordomía</span>
          <h1 className="text-2xl font-semibold text-primary mt-0.5">Calendario de Consejos</h1>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2 rounded-lg shadow-sm text-sm font-medium"
        >
          <Plus size={18} /> Nueva reunión
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TIPOS.map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filtro === t ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30'
            }`}
          >
            {t === 'Todas' ? 'Todas' : ETIQUETAS[t]}
          </button>
        ))}
      </div>

      {cargando && <p className="text-sm text-on-surface-variant">Cargando reuniones...</p>}
      {!cargando && visibles.length === 0 && <p className="text-sm text-on-surface-variant">No hay reuniones registradas.</p>}

      <div className="space-y-4">
        {visibles.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase text-secondary">{ETIQUETAS[r.tipo]}</span>
                  <StatusBadge status={r.estado === 'planificada' ? 'info' : 'neutral'}>{r.estado}</StatusBadge>
                </div>
                <h4 className="text-lg font-semibold text-primary">{ETIQUETAS[r.tipo]} - {r.fecha}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant pt-1">
                  <span className="flex items-center gap-1"><Calendar size={14} className="text-secondary" /> {r.fecha}</span>
                  {r.usuarios?.nombre && (
                    <span className="flex items-center gap-1"><UserCheck size={14} className="text-secondary" /> Preside: {r.usuarios.nombre}</span>
                  )}
                </div>
              </div>
              <Link
                to={r.tipo === 'obispado' ? `/reuniones/obispado/${r.id}` : `/reuniones/${r.id}`}
                className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <ListChecks size={14} /> Ver agenda
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <NuevaReunionModal open={modalAbierto} onClose={() => setModalAbierto(false)} onCreada={cargar} />
    </div>
  )
}