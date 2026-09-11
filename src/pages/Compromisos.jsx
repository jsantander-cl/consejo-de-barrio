import { Plus } from 'lucide-react'
import { StatusBadge } from '../components/ui.jsx'

// TODO: reemplazar por SELECT * FROM asignaciones WHERE estado = :columna
const COLUMNAS = [
  {
    key: 'pendiente',
    titulo: 'Pendiente',
    dot: 'bg-outline',
    items: [
      { titulo: 'Contactar familia Gómez para visita de bienestar', org: 'Cuórum de Élderes', responsable: 'Carlos Mendoza', fecha: '16 May', vencida: true },
      { titulo: 'Coordinar cena para los misioneros del sector norte', org: 'Sociedad de Socorro', responsable: 'Elena Castro', fecha: '20 May' },
      { titulo: 'Asignar maestras de sustitución para clase Valientes 9', org: 'Primaria', responsable: 'Patricia M.', fecha: '25 May' },
    ],
  },
  {
    key: 'proceso',
    titulo: 'En proceso',
    dot: 'bg-status-warning-text',
    items: [
      { titulo: 'Revisar certificados de recomendación para bautismos vicarios', org: 'Obispado', responsable: 'Roberto Díaz', fecha: 'Vence domingo' },
      { titulo: 'Planificar noche de deportes de jóvenes', org: 'Mujeres Jóvenes', responsable: 'Lucía Vega', fecha: '22 May' },
      { titulo: 'Confirmar fechas de bautismo de la familia Morales', org: 'Misioneros', responsable: 'Élder Davis', fecha: '24 May' },
    ],
  },
  {
    key: 'cumplido',
    titulo: 'Cumplido',
    dot: 'bg-status-success-text',
    items: [
      { titulo: 'Entregar paquete de bienvenida a Ana Ramos', org: 'Sociedad de Socorro', responsable: 'Mariana Torres', fecha: 'Cumplido 15 May' },
      { titulo: 'Confirmación de discursantes para conferencia', org: 'Obispado', responsable: 'Obispo Silva', fecha: 'Cumplido 12 May' },
    ],
  },
]

export default function Compromisos() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-secondary tracking-wide uppercase font-semibold">Seguimiento ministerial</span>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Tablero de Compromisos</h1>
        </div>
        <button className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
          <Plus size={18} /> Nueva asignación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNAS.map((col) => (
          <div key={col.key} className="flex flex-col bg-surface-container-low/70 rounded-2xl p-3 md:p-4 border border-outline-variant/30 min-h-[300px]">
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
              <h2 className="font-semibold text-primary">{col.titulo}</h2>
              <span className="px-2 py-0.5 rounded-full bg-surface text-xs font-semibold text-on-surface-variant border border-outline-variant/30">
                {col.items.length}
              </span>
            </div>
            <div className="space-y-3 flex-1">
              {col.items.map((item) => (
                <article key={item.titulo} className={`bg-surface-container-lowest rounded-xl p-4 border shadow-sm ${item.vencida ? 'border-2 border-error/50' : 'border-outline-variant/30'}`}>
                  {item.vencida && <StatusBadge status="danger">Vencida</StatusBadge>}
                  <div className="mt-1 mb-1">
                    <span className="text-xs text-secondary font-bold uppercase tracking-wider">{item.org}</span>
                  </div>
                  <h3 className="font-semibold text-primary leading-snug mb-2">{item.titulo}</h3>
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="font-medium text-on-surface">{item.responsable}</span>
                    <span className={item.vencida ? 'text-error font-semibold' : 'text-on-surface-variant'}>{item.fecha}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
