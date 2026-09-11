import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, UserCheck, ListChecks } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'

const TIPOS = ['Todas', 'Consejo de Barrio', 'Reunión de Obispado', 'Comité de Jóvenes']

// TODO: reemplazar por SELECT * FROM reuniones ORDER BY fecha DESC
const REUNIONES = [
  { id: '1', tipo: 'Consejo de Barrio', titulo: 'Consejo de Barrio - Mayo 2025', fecha: '18 May · 07:30 AM', estado: 'Programada', preside: 'Obispo Mateo Silva', ruta: '/reuniones/1' },
  { id: '2', tipo: 'Obispado', titulo: 'Reunión de Obispado', fecha: '14 May · 06:30 AM', estado: 'Finalizada', preside: 'Obispo Mateo Silva', ruta: '/reuniones/obispado/2' },
  { id: '3', tipo: 'Consejo de Barrio', titulo: 'Consejo de Barrio - Abril 2025', fecha: '20 Abr', estado: 'Finalizada', preside: null, ruta: '/reuniones/3' },
]

export default function Reuniones() {
  const [filtro, setFiltro] = useState('Todas')
  const visibles = REUNIONES.filter((r) => filtro === 'Todas' || r.tipo === filtro || (filtro === 'Reunión de Obispado' && r.tipo === 'Obispado'))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Deliberación & Mayordomía</span>
          <h1 className="text-2xl font-semibold text-primary mt-0.5">Calendario de Consejos</h1>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2 rounded-lg shadow-sm text-sm font-medium">
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
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibles.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase text-secondary">{r.tipo}</span>
                  <StatusBadge status={r.estado === 'Programada' ? 'info' : 'neutral'}>{r.estado}</StatusBadge>
                </div>
                <h4 className="text-lg font-semibold text-primary">{r.titulo}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant pt-1">
                  <span className="flex items-center gap-1"><Calendar size={14} className="text-secondary" /> {r.fecha}</span>
                  {r.preside && <span className="flex items-center gap-1"><UserCheck size={14} className="text-secondary" /> Preside: {r.preside}</span>}
                </div>
              </div>
              <Link
                to={r.ruta}
                className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <ListChecks size={14} /> Ver agenda
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
