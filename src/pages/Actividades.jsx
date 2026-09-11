import { Plus, Calendar, MapPin } from 'lucide-react'
import { Card, StatusBadge } from '../components/ui.jsx'

// TODO: reemplazar por SELECT * FROM actividades ORDER BY fecha
const ACTIVIDADES = [
  { titulo: 'Noche de Deportes y Convivencia Juvenil', org: 'Mujeres Jóvenes + Hombres Jóvenes', fecha: 'Vie, 23 Mayo · 19:00 hrs', lugar: 'Centro de Estaca', estado: 'Aprobada por Obispado', badge: 'success' },
  { titulo: 'Taller de Autosuficiencia y Huertos Familiares', org: 'Sociedad de Socorro', fecha: 'Sáb, 31 Mayo · 10:00 hrs', lugar: 'Salón Cultural del Barrio', estado: 'En Planificación', badge: 'warning' },
  { titulo: 'Conferencia de Barrio y Almuerzo de Hermandad', org: 'Obispado · Todo el barrio', fecha: 'Dom, 15 Junio · 10:00 hrs', lugar: 'Capilla Los Olivos', estado: 'Aprobada', badge: 'info' },
  { titulo: 'Campamento Anual de la Primaria', org: 'Primaria', fecha: 'Sáb, 05 Julio · 09:00 hrs', lugar: 'Parque Los Manantiales', estado: 'Propuesta para revisión', badge: 'neutral' },
]

export default function Actividades() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary font-semibold flex items-center gap-1.5"><Calendar size={14} /> CALENDARIO DE BARRIO</span>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Planificación y Coordinación</h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Planificación y aprobación coordinada entre organizaciones para bendecir familias y fomentar la unidad.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-lg shadow-sm">
          <Plus size={20} /> Proponer actividad
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ACTIVIDADES.map((a) => (
          <Card key={a.titulo}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 px-3 py-1 rounded-lg text-sm">
                <Calendar size={16} className="text-primary" />
                <span className="font-medium text-primary">{a.fecha}</span>
              </div>
              <StatusBadge status={a.badge}>{a.estado}</StatusBadge>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-md bg-secondary-container/60 text-on-secondary-container font-semibold">{a.org}</span>
            <h3 className="text-lg font-bold text-primary mt-2">{a.titulo}</h3>
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mt-3 pt-3 border-t border-outline-variant/20">
              <MapPin size={16} className="text-outline" />
              <span>{a.lugar}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
