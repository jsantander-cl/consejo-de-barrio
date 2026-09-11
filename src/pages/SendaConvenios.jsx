import { UserPlus, Check, Circle, Clock } from 'lucide-react'
import { StatusBadge } from '../components/ui.jsx'

// TODO: reemplazar por join entre miembros_seguimiento y miembro_checklist_progreso,
// filtrando checklist_item donde aplica = true (el modelo flexible que definimos:
// cada hito puede desactivarse por persona sin borrarse del historial)
const MIEMBROS = [
  {
    id: 1,
    nombre: 'Familia Morales (David y Lucía)',
    tipo: 'Nuevo Converso',
    ministrantes: 'Carlos Mendoza y Roberto Díaz',
    progreso: '4 de 7',
    hitos: [
      { nombre: 'Bautismo y Confirmación', estado: 'cumplido' },
      { nombre: 'Sacerdocio Aarónico', estado: 'cumplido' },
      { nombre: 'Historia Familiar / Nombres', estado: 'cumplido' },
      { nombre: 'Bautismos Vicarios', estado: 'cumplido' },
      { nombre: 'Conferencia de Estaca', estado: 'en_curso' },
      { nombre: 'Preparación para el Templo', estado: 'pendiente' },
      { nombre: 'Sellamiento Familiar', estado: 'pendiente' },
    ],
  },
  {
    id: 2,
    nombre: 'Mateo Fernández',
    tipo: 'Reactivado / Amigo',
    ministrantes: 'Elena Castro',
    progreso: '3 de 7',
    hitos: [
      { nombre: 'Recontacto', estado: 'cumplido' },
      { nombre: 'Sacramental', estado: 'cumplido' },
      { nombre: 'Entrevista Obispado', estado: 'cumplido' },
      { nombre: 'Actividad de Barrio', estado: 'en_curso' },
      { nombre: 'Recomendación Templo', estado: 'pendiente' },
      { nombre: 'Bautismos Vicarios', estado: 'pendiente' },
      { nombre: 'Llamamiento', estado: 'pendiente' },
    ],
  },
]

function IconoHito({ estado }) {
  if (estado === 'cumplido') return <Check size={14} />
  if (estado === 'en_curso') return <Clock size={14} />
  return <Circle size={12} />
}

export default function SendaConvenios() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Senda de Convenios</h1>
          <p className="text-sm text-on-surface-variant">18 miembros en progreso ministerial</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
          <UserPlus size={18} /> Agregar miembro a seguimiento
        </button>
      </div>

      <div className="space-y-4">
        {MIEMBROS.map((m) => (
          <article key={m.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 bg-surface-container-low/40 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0">
                  {m.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-primary">{m.nombre}</h3>
                    <StatusBadge status="info">{m.tipo}</StatusBadge>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">Ministrantes: <strong className="text-on-surface font-medium">{m.ministrantes}</strong></p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs uppercase text-on-surface-variant block">Progreso de la senda</span>
                <span className="text-lg font-bold text-secondary">{m.progreso} hitos</span>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-x-auto">
              <div className="min-w-[640px] flex items-center justify-between relative py-2">
                <div className="absolute left-4 right-4 top-4 h-0.5 bg-outline-variant/30 -z-0" />
                {m.hitos.map((h) => (
                  <div key={h.nombre} className="flex flex-col items-center text-center relative z-10 w-24">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        h.estado === 'cumplido'
                          ? 'bg-secondary text-on-secondary'
                          : h.estado === 'en_curso'
                          ? 'bg-status-warning-bg text-status-warning-text border-2 border-status-warning-text'
                          : 'bg-surface-container text-outline border border-outline-variant'
                      }`}
                    >
                      <IconoHito estado={h.estado} />
                    </div>
                    <span className="mt-2 text-xs font-medium text-primary leading-tight">{h.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
